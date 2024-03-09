import hvac
import requests

from django.core.exceptions import ImproperlyConfigured

from django.db.backends.postgresql import base


class DatabaseWrapper(base.DatabaseWrapper):

    _hvac = None

    vault_token_file = '/run/secrets/key'

    def _get_hvac_client(self):
        if self._hvac is None:
            vault_url, vault_token = self._get_vault_login_credentials()
            self._hvac = hvac.Client(url=vault_url)
            if vault_token is not None:
                self._hvac.token = vault_token
        return self._hvac

    def _get_vault_login_credentials(self):
        settings_dict = self.settings_dict
        vault_url = settings_dict.get('VAULT_ADDR', None)
        with open(self.vault_token_file, 'r') as file:
            vault_token=file.read().strip()
        return (vault_url, vault_token)

    def _get_database_credentials_from_vault(self):
        client = self._get_hvac_client()

        if not client.is_authenticated():
            raise RuntimeError("Not authenticated to Vault.")
        settings_dict = self.settings_dict
        vault_role_name = settings_dict.get('VAULT_ROLE_NAME', None)
        vault_db_mount_point = settings_dict.get('VAULT_DB_MOUNT_POINT', None)

        if vault_role_name is None:
            raise ImproperlyConfigured(
                "settings.DATABASES is improperly configured. ")
        params = {
            'name': vault_role_name,
            'mount_point': vault_db_mount_point,
        }
        creds = client.secrets.database.generate_credentials(**params)
        return creds

    def _get_username_password_from_vault(self):
        creds = self._get_database_credentials_from_vault()
        data = creds.get('data')
        username = data.get('username')
        password = data.get('password')
        return (username, password)

    def get_connection_params(self):
        self.settings_dict['USER'] = ''
        self.settings_dict['PASSWORD'] = ''

        conn_params = super().get_connection_params()

        del self.settings_dict['USER']
        del self.settings_dict['PASSWORD']

        username, password = self._get_username_password_from_vault()

        conn_params['user'] = username
        conn_params['password'] = password

        return conn_params


import os
import hvac

with open('/run/secrets/key', 'r') as file:
    vault_token=file.read().strip()

vault_client = hvac.Client(url='http://vault:8200', token=f'{vault_token}')
path = 'kv/env-vars'

def get_env_variable(var_name):
    if not vault_client.is_authenticated():
        vault_client.auth_token(f'{vtoken}')
    secret_data = vault_client.read(path)
    if secret_data and 'data' in secret_data:
        return secret_data['data'].get(var_name)
    else:
        return None

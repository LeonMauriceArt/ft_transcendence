import os
import hvac

with open('/run/secrets/key', 'r') as file:
    vault_token=file.read().strip()

vault_client = hvac.Client(url='http://vault:8200', token=f'{vault_token}')

def get_env_variable(var_name):
    if not vault_client.is_authenticated():
        vault_client.auth_token(f'{vault_token}')
    secret = vault_client.read('kv/env-vars')
    if secret and 'data' in secret:
        return secret['data'].get(var_name)
    else:
        return None

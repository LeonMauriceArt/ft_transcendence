# cat <<EOF | vault policy write my-policy -
# path "database/creds/db-role" {
#   capabilities = ["create", "read", "update", "delete"]
# }
# EOF

# vault secrets enable -path=my-secret kv

# vault kv put secret/my-secret ke1=value1 key2=value2

# vault token create -policy=my-policy -format=json > token.json

# VAULT_TOKEN=$(cat token.json | jq -r '.auth.client_token')

# echo "Vault token: $VAULT_TOKEN"
vault login $VAULT_DEV_ROOT_TOKEN_ID

vault secrets enable database

vault write database/config/my-postgresql-database \
    plugin_name=postgresql-database-plugin \
    allowed_roles="*" \
    connection_url="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$HOST/$POSTGRES_NAME"

vault write database/roles/my-role \
    db_name=my-postgresql-database \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

vault login $VAULT_DEV_ROOT_TOKEN_ID

vault secrets enable database

vault write database/config/postgresql-database \
    plugin_name=postgresql-database-plugin \
    allowed_roles="*" \
    connection_url="postgresql://{{username}}:{{password}}@$DB_HOST:5432/$POSTGRES_NAME" \
    username="$POSTGRES_USER" \
    password="$POSTGRES_PASSWORD"

vault write database/roles/my-role \
    db_name=postgresql-database \
    creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; \
        GRANT USAGE ON SEQUENCE users_userprofile_id_seq TO \"{{name}}\"; \
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO \"{{name}}\"; \
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO \"{{name}}\";" \
    default_ttl="1h" \
    max_ttl="24h"

vault policy write super-db /policy.hcl

vault token create -policy=super-db -format=json > token.json

cat token.json | jq -r '.auth.client_token' > /vault/data/skey

sleep infinity


# cat <<EOF | vault policy write read-db -
# path "database/creds/read-role" {
#   capabilities = ["read"]
# }
# EOF

# vault token create -policy=red-db -format=json > token.json

# cat token.json | jq -r '.auth.client_token' > keys/key

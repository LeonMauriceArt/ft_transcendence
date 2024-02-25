cat <<EOF | vault policy write my-policy -
path "secret/data/my-secret" {
  capabilities = ["create", "read", "update", "delete"]
}
EOF

vault secrets enable -path=my-secret kv

vault kv put secret/my-secret ke1=value1 key2=value2

vault token create -policy=my-policy -format=json > token.json

TOKEN=$(cat token.json | jq -r '.auth.client_token')

echo "Vault token: $TOKEN"

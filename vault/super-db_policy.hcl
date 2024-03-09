path "database/creds/my-role" {
 capabilities = ["create", "read", "update", "delete"]
}

path "kv/env-vars" {
  capabilities = ["read"]
}

path "sys/mounts/database" {
 capabilities = ["read", "create", "update"]
}

path "database/config/postgresql-database" {
 capabilities = ["read", "create", "update"]
}

path "database/roles/my-role" {
 capabilities = ["read", "create", "update"]
}

path "sys/policies/acl/super-db" {
 capabilities = ["read", "create", "update"]
}

path "auth/token/create" {
 capabilities = ["read", "create"]
}

path "auth/token/lookup-self" {
 capabilities = ["read"]
}

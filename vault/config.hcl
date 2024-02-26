storage "file" {
  path = "/vault/data"
}

listener "tcp" {
  address     = "127.0.0.1:8300"
  tls_disable = 1
}

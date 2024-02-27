# vault server -config /vault/config/config.hcl
vault server -dev &

sleep 2

/bin/sh /usr/local/bin/config_path.sh

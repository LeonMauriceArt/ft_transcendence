# vault server -config /config/config.hcl

vault server -config /config/config.hcl -dev &

sleep 5

/bin/sh /usr/local/bin/config_path.sh

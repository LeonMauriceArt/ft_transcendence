vault server -config /config/config.hcl &

sleep 2

if [ -f /vault/data/core/.vault_keys_unseal_key ]; then
    export VAULT_UNSEAL_KEY=$(cat /vault/data/core/.vault_keys_unseal_key)
    export VAULT_ROOT_TOKEN=$(cat /vault/data/core/.vault_keys_root_token)
    vault operator unseal $VAULT_UNSEAL_KEY
    sleep infinity
else
    vault operator init -key-shares=1 -key-threshold=1 -format=json > init.json

    export VAULT_UNSEAL_KEY=$(cat init.json | jq -r '.unseal_keys_b64[0]')
    export VAULT_ROOT_TOKEN=$(cat init.json | jq -r '.root_token')
    echo $VAULT_UNSEAL_KEY > /vault/data/core/.vault_keys_unseal_key
    echo $VAULT_ROOT_TOKEN >> /vault/data/core/.vault_keys_root_token
    vault operator unseal $VAULT_UNSEAL_KEY
    export VAULT_TOKEN=$VAULT_ROOT_TOKEN
    /bin/sh /usr/local/bin/config_path.sh
fi



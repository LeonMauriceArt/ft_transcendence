FROM hashicorp/vault:latest

RUN wget -O /usr/local/bin/jq https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 && \
    chmod +x /usr/local/bin/jq

COPY config.hcl /vault/config/config.hcl

COPY start_vault.sh start_up.sh
COPY config_path.sh /usr/local/bin/config_path.sh

RUN chmod +x start_up.sh

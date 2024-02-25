FROM hashicorp/vault:latest

RUN wget -O /usr/local/bin/jq https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 && \
    chmod +x /usr/local/bin/jq

COPY start_vault.sh /start_up

RUN chmod +x start_up

# CMD ["./start_up"]

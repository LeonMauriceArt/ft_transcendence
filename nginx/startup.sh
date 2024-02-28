openssl req -x509 -nodes -out /etc/nginx.crt -keyout /etc/nginx.key -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=transcendence.fr/UID=lmaurin-"

nginx -g 'daemon off;'

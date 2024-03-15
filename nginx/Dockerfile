FROM nginx:latest

RUN apt-get update && apt-get install -y -f \
    build-essential \
    libpcre3-dev \
    libssl-dev \
    libmodsecurity-dev \
    git \
    g++ \
    gcc \
    automake \
    libtool autoconf automake autotools-dev zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity /etc/modsecurity

RUN cd /etc/modsecurity \
    && git submodule init \
    && git submodule update \
    && ./build.sh \
    && ./configure \
    && make \
    && make install

RUN apt-get update && apt-get install -y wget && wget http://nginx.org/download/nginx-1.25.4.tar.gz && tar -xzf nginx-1.25.4.tar.gz && rm nginx-1.25.4.tar.gz

RUN git clone https://github.com/SpiderLabs/ModSecurity-nginx /etc/modsecurity/ModSecurity-nginx

RUN cd /nginx-1.25.4 \
    && ./configure --with-compat --with-ld-opt='-lpcre' --with-openssl=/usr/include/openssl/ --add-dynamic-module=/etc/modsecurity/ModSecurity-nginx \
    && make && make install \
    && make modules \
    && cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

RUN git init && git submodule add https://github.com/SpiderLabs/owasp-modsecurity-crs.git /etc/modsecurity/crs \
    && cd /etc/modsecurity/crs && git submodule update --init

COPY modsecurity.conf /etc/modsecurity/modsecurity.conf
COPY nginx.conf /etc/nginx/nginx.conf
COPY startup.sh .
COPY main.conf /etc/nginx/modsec/main.conf

RUN cp /etc/modsecurity/crs/crs-setup.conf.example /etc/modsecurity/crs/crs-setup.conf \
    && cp /etc/modsecurity/crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf.example /etc/modsecurity/crs/rules/REQUEST-900-EXCLUSION-RULES-BEFORE-CRS.conf

RUN cp /etc/modsecurity/unicode.mapping /etc/nginx/modsec

COPY modsecurity.conf /etc/nginx/modsec/modsecurity.conf

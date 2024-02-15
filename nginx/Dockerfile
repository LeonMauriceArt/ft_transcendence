FROM nginx:latest

RUN apt-get update && apt-get install -y \
    build-essential \
    libpcre3-dev \
    libssl-dev \
    libmodsecurity-dev \
    git \
    g++ \
    gcc \
    automake \
    libtool autoconf automake autotools-dev zlib1g-dev\
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 -b v3/master --single-branch https://github.com/SpiderLabs/ModSecurity /usr/src/modsecurity

RUN cd /usr/src/modsecurity \
    && git submodule init \
    && git submodule update \
    && ./build.sh \
    && ./configure \
    && make \
    && make install

RUN apt-get update && apt-get install -y wget && wget http://nginx.org/download/nginx-1.25.4.tar.gz && tar -xzf nginx-1.25.4.tar.gz && rm nginx-1.25.4.tar.gz

RUN git clone https://github.com/SpiderLabs/ModSecurity-nginx /usr/src/ModSecurity-nginx

RUN cd /nginx-1.25.4 \
    && ./configure --with-compat --with-ld-opt='-lpcre' --with-openssl=/usr/include/openssl/ --add-dynamic-module=/usr/src/ModSecurity-nginx \
    && make && make install \
    && make modules \
    && cp objs/ngx_http_modsecurity_module.so /etc/nginx/modules/

RUN git clone --depth 1 -b v4.0/dev --single-branch https://github.com/coreruleset/coreruleset /usr/src/modsecurity-crs

RUN cp -R /usr/src/modsecurity-crs/rules /etc/nginx/modsec

EXPOSE 80
EXPOSE 443

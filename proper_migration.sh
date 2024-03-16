#!/bin/bash

while true
do
    if docker-compose -f docker-compose.yml ps | grep -q "ft_trans-web.*Up"; then
        sleep 11
        make migrations
        break
    else
        sleep 1
    fi
done

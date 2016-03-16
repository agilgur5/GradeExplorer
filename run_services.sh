#!/bin/sh

# store initial location to later return to
INITIAL_LOCATION=$(pwd);

echo 'Running front end services...';
cd /vagrant/static;
docker-compose up -d;

# return to initial location
cd $INITIAL_LOCATION;

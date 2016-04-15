#!/bin/sh

# store initial location to later return to
INITIAL_LOCATION=$(pwd);

echo 'Running back end services...';
cd /vagrant/app;
docker-compose up -d;

echo 'Running front end services...';
cd /vagrant/static;
docker-compose up -d;

# return to initial location
cd $INITIAL_LOCATION;

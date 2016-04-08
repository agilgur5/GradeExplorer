FROM python:2.7

WORKDIR /code
COPY ./requirements.txt ./requirements.txt

#RUN pip install -r requirements.txt

# native dependencies
RUN apt-get update && apt-get install -qqy --no-install-recommends \
  python-numpy \
  python-scipy && \
  apt-get autoremove -qqy && apt-get clean -qqy && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# link system wide dependencies (numpy + scipy)
ENV PYTHONPATH=$PYTHONPATH:/usr/lib/python2.7/dist-packages/

ADD ./ ./



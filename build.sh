#!/bin/sh
MODULE=$1


docker build -t softbrix/shatabang-$MODULE -f $MODULE/Dockerfile .
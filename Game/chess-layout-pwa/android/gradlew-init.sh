#!/bin/bash

# 设置 Java 环境为 Java 17
export JAVA_HOME=/usr/local/opt/openjdk@17
export PATH="$JAVA_HOME/bin:$PATH"

# 传递所有参数给 gradlew
exec ./gradlew "$@"
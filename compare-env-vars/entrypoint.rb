#!/usr/bin/env ruby

require 'dotenv'
require 'json'
require 'yaml'

empire_rpc_secrets = JSON.parse(ARGV[0])
empire_grpc_secrets = JSON.parse(ARGV[1]).merge(empire_rpc_secrets).keys
empire_grpc_local_env = Dotenv.load('./.env').keys

if empire_grpc_secrets.size != empire_grpc_local_env.size
  local_missing = empire_grpc_secrets - empire_grpc_local_env
  secrets_missing = empire_grpc_local_env - empire_grpc_secrets

  puts "\e[31mLocal .env has #{empire_grpc_local_env.size} keys, whereas grpc/rpc secrets contain #{empire_grpc_secrets.size}\e[0m"

  unless local_missing.empty?
    puts "\e[31mLocal is missing env vars: #{local_missing.join(',')}\e[0m"
  end

  unless secrets_missing.empty?
    puts "\e[31mSecret manager is missing env vars: #{secrets_missing.join(',')}\e[0m"
  end

  exit(1)
end

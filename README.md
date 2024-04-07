# Gldv

This is a CLI tool for use with Gleam. It's main purpose is to allow hot reloading for web applications that use Gleam.

## Installation

Use your favorite package manager to install it. This example uses npm.

```sh
npm i gldv
```

## Usage

This tool has three commands:

- `dev` - Start the development server
- `create` - Create a new config file
- `help` - Display the help message

As can be seen here:
```sh
gldv help
```
```
Usage:
   - dev - Start the development server
   - create - Create a new config file
   - help - Display this help message
```

### Dev

It actually executes whatever you set as the `run` command in the config file. If you haven't created a config file yet, it assumes you want to run default config, and it will warn you.

```sh
gldv dev
```

### Create

Creates a new config file in the current directory. This file is used to configure the server.

```sh
gldv create
```
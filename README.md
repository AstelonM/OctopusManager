# Octopus Manager

OctopusManager is a process manager that lets you manage and interact with various processes you host on a remote server 
through a web interface.

Main features include:
- Set up accounts with three levels of permission: one "root" account with access to everything, admin accounts to manage 
processes and other accounts, and user accounts which only allow interacting with the processes and their files.
- Define processes, start, stop, kill or restart them. OctopusManager will also restart processes in case they crash, based
on how you configured them.
- Manage the files and directories of the processes defined in OctopusManager. Most basic operations you can do in a file
explorer are available.
- View process consoles in real time and interact with them through commands, if the process supports it.

## Setup

OctopusManager only needs Java 17 in order to run, so make sure you have it available on the server.

Steps to install and run OctopusManager:
- Download the latest version available [here](https://github.com/AstelonM/OctopusManager/releases/latest).
- Optionally, download the `config.yml` file of the release and put it in the same directory as the jar file, then modify 
it for your needs. OctopusManager will create a default configuration file if it's started without one, which you can then 
modify, followed by restarting the manager to apply your changes.
- Start OctopusManager using `java -jar <OctopusManager jar file>`. You may want to use a service manager like systemd.
**Note:** OctopusManager already writes its logs in a directory called `logs` that's created next to the jar file.
- When you first access the website, you will be asked to create a root account. Make sure you save the credentials, because
they cannot be recovered if lost. If you do lose them, you will have to delete the `data` directory, which will remove all
the accounts. The next time you'll visit the website, you will be asked again with creating a root account. Note that
OctopusManager will need to be shut down before deleting the `data` directory.

### Configuration

Although OctopusManager doesn't actually need to be configured in order to be used, it is recommended you do so.
The default `config.yml` file looks like this:

```yaml
server:
  # The port OctopusManager will use.
  port: 8080
  # Currently only key stores in JKS or PKCS12 formats are supported for SSL certificates.
  ssl:
    # Whether to use HTTPS instead of HTTP.
    enabled: false
    # The type of the key store, JKS or PKCS12.
    key-store-type: ""
    # Path to the key store that contains the certificate.
    key-store: ""
    # The password used to access the key store.
    key-store-password: ""
    # The alias of the key inside the key store.
    key-alias: ""
    # The password used to access the key in the key store. If the key isn't protected by a password, leave this field commented.
    # key-password: ""
```

## Setup for development

If you're planning on compiling OctopusManager yourself, you're going to need the following:
- JDK 17
- Node.js 18.14.0
- Yarn 3.3.1
- Git

Once you cloned this repository, you can use the gradle tasks `bootRun` to compile the code and run it in the IDE, and
`bootJar` to build the jar, which will be found in the `build/libs` directory.

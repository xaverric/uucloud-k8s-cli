# uucloud-k8s-cli

### [ume-deployment-checker](https://github.com/xaverric/ume-deployment-checker.git) becomes [uucloud-k8s-cli](https://github.com/xaverric/uucloud-k8s-cli.git) with the v2 release 🙌

[ume-deployment-checker](https://github.com/xaverric/ume-deployment-checker.git) is no longer maintained as [uucloud-k8s-cli](https://github.com/xaverric/uucloud-k8s-cli.git) project is its direct successor and extends the feature pallet to not only provide check features, but much more.


## Installation 
```
npm install -g uucloud-k8s-cli
```

## Usage
```
uucloud-k8s <command> <command parameters>
```

## Commands
```
help      Display help
check     Performs checks based on given parameters and configuration.
print     Performs print based on given parameters and configuration. Result is printed into the defined bookkit page.
update    Performs update of the node selectors based on the configuration right in the k8s cluster.
scaleUp   Scale uuApps up according to configuration.
scaleDown Scale uuApps down according to configuration.
overview  Performs overview of multiple environments at once.
version   Show tool version.
```

## Parameters

### --command string           
check, help commands. All these can be used as default commands without providing --command argument.

### -c, --config string        
Base configuration folder path containing *env.json* files with *contexts.json* for each environment.

### -e, --environment string   
Environment name defined in the base configuration folder unde the filename [env].json.

### -v, --version              
Display version of all uuApps deployed in the given environment.

### -r, --rts                  
Display runtime stack of all uuApps deployed in the given environment.

### -d, --deployment           
Display and verify number and status of deployed uuApps in the given environment.

### -u, --uri                  
Display uuApp deployment URI of all uuApps deployed in the given environment.

### -n, --nodesize             
Display uuApp node size of all uuApps deployed in the given environment.

### --memory                   
Display uuApp RAM of all uuApps deployed in the given environment.

### --cpu                      
Display uuApp CPU of all uuApps deployed in the given environment.

### --status
Display container uuApp status.

### --volume
Display and verify uuApp volume mount.

### -t, --table               
Diplay the ouput in the table form.

### --problemReportToBookkit
Flag applicable for the print task only. Task prints problems only to the specific bookkit page.

### --problemReportToEmail
Flag applicable for the print task only. Task reports problems via e-mail notification. Can be used for both, print and check task.

## Configuration 

### [env].json, i.e. env1.json
```
{
  "uu-app-name": {
    "required": true, // identify whether should be checked by the tool at all
    "count": 1, // how many instances of the given uuApp with "uu-app-name" expected 
    "nodeSelectors": [ // expected node selectors, verified with deep equality
      {
        "key": "kind",
        "operator": "In",
        "values": [
          "app-mpls1"
        ],
        "nodeSize": "NODESIZE_NAME"  
      },
      {
        "key": "archive",
        "operator": "NotIn",
        "values": [
          "not"
        ]
      }
    ]
  },
  ...
```

### contexts.json
```
[
  {
    "environment": "env1", // environment name, with same name the env1.json file must exist in the same folder
    "context": "env1-context-name", // k8s cluster name to which the tool will switch context via kubectl
    "nameSpace": "env1-namespace-name" // cluster namespace where the environment lives
  },
  ...
]
```

### nodesizes.json
```
{
  "NODESIZE_NAME": {
    "cpu": "1",
    "memory": "512Mi"
  },
  ...
}

// Another option is to define array of values. This might get handy if different representations are used for the same value.
{
  "NODESIZE_NAME": {
    "cpu": ["1", "1000m"],
    "memory": ["512Mi", "512"]
  },
  ...
}
```

### bookkit-config.json
```
{
  "accessCode1": "...", // login credentials to bookkit (user must have privileges to mannipulate with the book content)
  "accessCode2": "...", // login credentials to bookkit (user must have privileges to mannipulate with the book content)
  "oidcHost": "...", // oidc/grantToken uri
  "uri": "...", // book base uri
  "overview": {
    "page": "...", // page coge
    "sections": {
       // section codes 
      "DEPLOYMENT": "...",
      "NODE_SIZE": "...",
      "SUM": "..."
    }
  },
  "environment": {
    "env1": { // environment name, with same name the env1.json file must exist in the same folder
      // page and sections codes must already exist in the book. Sections will be updated with content from the uucloud-k8s-cli
      "page": "env1-page-code",
      "sections": {
        // section codes for each check in the given bookkit page.
        "DEPLOYMENT": "",
        "NODE_SIZE": "...",
        "VERSION": "...",
        "RUNTIME_STACK": "...",
        "UUAPP_DEPLOYMENT_URI": "...",
        "MEMORY": "...",
        "CPU": "...",
        "CONTAINER_STATUS": "..."
      },
      // page for reporting the problems only - with this configuration you can have all problems from all environments in one place
      "problemReport": {
        "page": "...",
        "section": "..."
      }
    },
    ...
  }
}
```

### email-config.json
```
{
    "transportsConfiguration": {
        "auth": {
            "pass": "password",
            "user": "username"
        },
        "host": "email server address",
        "port": 465, 
        "secure": true
    },
    "recipients": [
        "recepient list email addresses"
    ]
}
```

## Logs
logs are automatically stored to the ```%HOME%/.uucloud-k8s/logs``` folder
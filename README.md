<p align="center">
  <img src="https://cdn.rawgit.com/sqmk/huejay/8ca17db521eab6dbcfeabf93483f2700d7aa44bb/media/logo.svg" alt="Huejay" />
</p>

# Huejay - Philips Hue client for Node.js

[![NPM Version](https://badge.fury.io/js/huejay.svg)](https://www.npmjs.com/package/huejay)
[![Build Status](https://api.travis-ci.org/sqmk/huejay.svg?branch=master)](https://travis-ci.org/sqmk/huejay)

Huejay is a client for the Philips Hue home lighting system.

Use Huejay to interact with Philips Hue in the following ways:
* [Bridge discovery](#bridge-discovery)
* [Manage bridge settings](#bridge)
* [Manage portal settings](#portal)
* [Manage software updates](#software-update)
* [Manage users](#users)
* [Manage lights](#lights)
* [Manage groups](#groups)
* [Manage schedules](#schedules)
* [Manage scenes](#scenes)
* [Manage sensors](#sensors)
* [Retrieve and delete rules](#rules)

Supported Philips Hue API version: **1.11.0**

Apple HomeKit is now supported.

## Installation

Huejay was written for **Node.js 4+**.

`npm install --save huejay`

## Basic Usage

Requiring the library is simple:

```js
let huejay = require('huejay');
```

Most methods return a `Promise` as a result. These are native Node.js promises.

### Bridge Discovery

Before interacting with your Hue system, you may want to know the availability
and IP addresses of your bridges. You can use Huejay's `discover` method to find
them.

```js
huejay.discover()
  .then(bridges => {
    for (let bridge of bridges) {
      console.log(`Id: ${bridge.id}, IP: ${bridge.ip}`);
    }
  })
  .catch(error => {
    console.log(`An error occurred: ${error.message}`);
  });
```

Huejay offers several strategies for bridge discovery:
* **nupnp**: Default option, uses Meethue's public API to discover local bridges
* **upnp**: Uses SSDP to discover local bridges
* **all**: Uses all available strategies for discovery

To use a specific discovery strategy:

```js
huejay.discover({strategy: 'upnp'})
  .then(bridges => {
    console.log(bridges);
  });
```

### Errors

Nearly all errors returned by Huejay are of type `huejay.Error`. Use this to
check Huejay specific errors.

## Client Usage

You can use Huejay to retrieve and manipulate resources on your preferred bridge.
Resources include users, lights, groups, scenes, and others.

To start, you must instantiate a client. The `Client` class is available for
convenience via Huejay;

```js
let client = new huejay.Client({
  host:     '123.0.12.34',
  port:     80,               // Optional
  username: 'bridgeusername', // Optional
});
```

If a *username* is not provided, nearly all commands will fail due to failure to
authenticate with the bridge. Be sure to provide a valid *username* to use all
client commands.

### Users

Huejay provides several commands for managing users on Philips Hue bridges.

#### client.users.create - Create user

You can use Huejay to create users on the bridge. Creating a user requires the
bridge's link button to be pressed. The link button is activated for roughly
30 seconds.

To create a user, instantiate a `User` object and pass it to `client.users.create`.
On successful creation, a brand new `User` object is returned by way of a `Promise`.
The `User` object will contain a username generated by the bridge. You can use
this username to authenticate against the bridge going forward.

```js
let user = new client.users.User;

// Optionally configure a device type / agent on the user
user.deviceType = 'my_device_type'; // Default is 'huejay'

client.users.create(user)
  .then(user => {
    console.log(`New user created - Username: ${user.username}`);
  })
  .catch(error => {
    if (error instanceof huejay.Error && error.type === 101) {
      return console.log(`Link button not pressed. Try again...`);
    }

    console.log(error.stack);
  });
```

*Note: The bridge does not permit supplying your own username.*

*Note: It is possible to use Huejay to toggle the link button if you are already
authenticated with the bridge. This may save you from walking over to the bridge
to physically press the link button. See `client.bridge.save` and `Bridge`
`linkButtonEnabled`.*

#### client.users.get - Get authenticated user

If the username assigned to the client is legitimate, you can get the details for
this user by calling `client.users.get`.

```js
client.users.get()
  .then(user => {
    console.log('Username:', user.username);
    console.log('Device type:', user.deviceType);
    console.log('Create date:', user.created);
    console.log('Last use date:', user.lastUsed);
  });
```

#### client.users.getByUsername - Get user by username

Although the bridge does not provide an equivalent API for retrieving a user
by username, Huejay provides a means to do so.

Simply pass in a string containing username to `client.users.getByUsername` to
look up the user.

```js
client.users.getByUsername('usernamehere')
  .then(user => {
    console.log(`Username: ${user.username}`);
  });
  .catch(error => {
    console.log(error.stack);
  });
```

If a user is not found with the provided username, a `huejay.Error` is thrown.

#### client.users.getAll - Get all users

Want to retrieve all users assigned to the bridge? You can use
`client.users.getAll` to do so. This method will return an array of `User`
objects.

```js
client.users.getAll()
  .then(users => {
    for (let user of users) {
      console.log(`Username: ${user.username}`);
    }
  });
```

#### client.users.delete - Delete a user

Deleting users using Huejay is simple. Provide either a username or `User`
object to `client.users.delete` to delete a user.

```js
client.users.delete('usernamehere')
  .then(() => {
    console.log('User was deleted');
  })
  .catch(error => {
    console.log(error.stack);
  });
```

### Bridge

Huejay supports retrieving and configuring the Philips Hue bridge. It supports
testing connection and authentication to the bridge as well.

#### client.bridge.ping - Test connection to the bridge

Use `client.bridge.ping` to test connection to your preferred bridge. Failed
connection results in a thrown `huejay.Error`.

```js
client.bridge.ping()
  .then(() => {
    console.log('Successful connection');
  })
  catch(error => {
    console.log('Could not connect');
  });
```

#### client.bridge.isAuthenticated - Test authentication to the bridge

To ensure your supplied client username can authenticate to the bridge, use
`client.bridge.isAuthenticated`. Authentication or connection failure will
result `huejay.Error` being thrown.

```js
client.bridge.isAuthenticated()
  .then(() => {
    console.log('Successful authentication');
  })
  catch(error => {
    console.log('Could not authenticate');
  });
```

#### client.bridge.get - Get bridge details and configuration

Want to get bridge details? Use Huejay's `client.bridge.get`
method. This will return a `Bridge` object, which can be used for reading
and saving configuration.

```js
client.bridge.get()
  .then(bridge => {
    console.log(`Retrieved bridge ${bridge.name}`);
    console.log('  Id:', bridge.id);
    console.log('  Model Id:', bridge.modelId);
  });
```

Attributes available on the `Bridge` object:
- `id` - Unique
- `name` - Name of the bridge
- `modelId` - Model Id
- `factoryNew` - Whether or not the bridge is factory new
- `replacesBridgeId` - Replaces bridge id (for migrating from old bridges)
- `softwareVersion` - Software version of the bridge
- `apiVersion` - API version of the bridge
- `zigbeeChannel` - ZigBee channel (for communicating with lights)
- `macAddress` - MAC address
- `ipAddress` - IP address
- `dhcpEnabled` - Whether or not DHCP is enabled
- `netmask` - Netmask
- `gateway` - Gateway
- `proxyAddress` - Proxy address
- `proxyPort` - Proxy port
- `utcTime` - UTC time of the bridge
- `timeZone` - Time zone
- `localTime` - Local time of the bridge
- `portalServicesEnabled` - Whether or not portal services are enabled
- `portalConnected` - Whether or not portal is connected
- `linkButtonEnabled` - Whether or not link button is enabled
- `touchlinkEnabled` - Whether or not Touchlink is enabled

#### client.bridge.save - Save bridge configuration

You can configure the bridge by changing values on the `Bridge` object and
passing to the `client.bridge.save` method. This method will return the same
`Bridge` for further manipulation.

```js
client.bridge.get()
  .then(bridge => {
    // Change bridge's name
    bridge.name = 'New bridge name';

    return client.bridge.save(bridge);
  })
  .then(bridge => {
    console.log(`Bridge is now named ${bridge.name}`);
  });
```

The following `Bridge` attributes are configurable:
- `name` - Name of the bridge
- `zigbeeChannel` - Preferred ZigBee channel
- `ipAddress` - IP address
- `dhcpEnabled` - `true` to enable, `false` to disable
- `netmask` - Netmask
- `gateway` - Gateway
- `proxyPort` - Proxy port
- `proxyAddress` - Proxy address
- `timeZone` - Any value available in `client.timeZones.getAll`
- `linkButtonEnabled` - `true` to toggle on temporarily
- `touchlinkEnabled` - `true` to toggle on temporarily

### Portal

The Philips Hue bridge allows connection to Philips' Meethue.com portal
services. You can use Meethue.com to remotely configure numerous resources
on your bridge, including lights, devices, and scenes.

Huejay provides a way to retrieve Meethue's portal connectivity details.

#### client.portal.get - Get portal details

Use `client.portal.get` to retrieve connectivity details. This method will
return a `Portal` object.

```js
client.portal.get()
  .then(portal => {
    console.log('Is signed on:', portal.signedOn);
    console.log('Incoming:', portal.incoming);
    console.log('Outgoing:', portal.outgoing);
    console.log('Communication:', portal.communication);
  });
```

### Software Update

Occasionally, Philips releases new updates for the bridge, lights, and devices.
You can use Huejay to facilitate downloading and installation of updates.  

#### client.softwareUpdate.get - Get software update details

To get software update details, use the `client.softwareUpdate.get` method to
retrieve a `SoftwareUpdate` object. This object provides details about any
pending updates to the bridge or other resources.

```js
client.softwareUpdate.get()
  .then(softwareUpdate => {
    console.log('State:', softwareUpdate.state);
    console.log('Release URL:', softwareUpdate.releaseUrl);
    console.log('Release notes:', softwareUpdate.releaseNotes);
  });
```

The following attributes are available on the `SoftwareUpdate` object:
- `state` - Update state, see below for values
- `checkingEnabled` - `true` if bridge is checking for updates, `false` if not
- `bridge` - `true` if updates are available for the bridge, `false` if not
- `lights` - An array of light ids with available updates
- `sensors` - An array of sensor ids with available updates
- `releaseUrl` - Release URL
- `releaseNotes` - Release notes
- `installNotificationEnabled` - Whether or not the install notification is enabled

The following are possible `state` values:
- `NO_UPDATE` - There are no updates available
- `DOWNLOADING` - Updates are being downloaded
- `READY_TO_INSTALL` - Updates are ready to be installed
- `INSTALLING` - Updates are installing

#### client.softwareUpdate.check - Make bridge check for software updates

You can request the bridge to check for software updates. Call the
`client.softwareUpdate.check` method to have the bridge start checking for
updates. A `huejay.Error` is thrown if the bridge is already checking.

```js
client.softwareUpdate.check()
  .then(() => {
    console.log('Bridge is checking for software updates');
  });
```

#### client.softwareUpdate.install - Start installation of pending updates

If there are any pending software updates, you can use `client.softwareUpdate.install`
to install them. A `huejay.Error` is thrown if there are no updates to install.

```js
client.softwareUpdate.install()
  .then(() => {
    console.log('Installation has begun');
  });
```

#### client.softwareUpdate.disableInstallNotification - Disables install notification

To disable the install notification (useful for mobile apps),
`client.softwareUpdate.disableInstallNotification` will allow you to turn off the
notification. This only works when the notification is enabled.

```js
client.softwareUpdate.disableInstallNotification()
  .then(() => {
    console.log('Install notification is now disabled');
  });
```

### Lights

The Philips Hue API exposes numerous endpoints for managing your lights. Huejay
supports it all, from searching and installing new lights, to changing light
attributes and state.

#### client.lights.scan - Scan for new lights

Hooked up a fresh Philips Hue bridge? Plugged in brand new bulbs or a fixture?
Before you can interact with your new lights, you'll need to add them to your
preferred bridge.

Huejay's `client.lights.scan` will get your bridge to start scanning for new,
unregistered lights. Scans last roughly 30 seconds. New bulbs can then be
retrieved by using `client.lights.getNew`.

```js
client.lights.scan()
  .then(() => {
    console.log('Started new light scan');
  });
```

*Note: Make sure your bulbs are powered on for your bridge to find them.*

#### client.lights.getNew - Get new lights

When bulbs are freshly registered on the bridge, you can retrieve them using
`client.lights.getNew`. This command will ultimately return an array of `Light` objects.

```js
client.lights.getNew()
  .then(lights => {
    console.log('Found new lights:');
    for (let light of lights) {
      console.log(`Light [${light.id}]:`);
      console.log('  Unique Id:', light.uniqueId);
      console.log('  Model:',     light.model.name);
      console.log('  Reachable:', light.reachable);
    }
  });
```

More information on `Light` objects is available in the following commands below.

#### client.lights.getAll - Get all registered lights

Huejay's `client.lights.getAll` will return a list of all registered lights on
the bridge. Like `client.lights.getNew`, the result from the completed `Promise`
will be an array of `Light` objects.

```js
client.lights.getAll()
  .then(lights => {
    for (let light of lights) {
      console.log(`Light [${light.id}]: ${light.name}`);
      console.log(`  Type:             ${light.type}`);
      console.log(`  Unique ID:        ${light.uniqueId}`);
      console.log(`  Manufacturer:     ${light.manufacturer}`);
      console.log(`  Model Id:         ${light.modelId}`);
      console.log('  Model:');
      console.log(`    Id:             ${light.model.id}`);
      console.log(`    Manufacturer:   ${light.model.manufacturer}`);
      console.log(`    Name:           ${light.model.name}`);
      console.log(`    Type:           ${light.model.type}`);
      console.log(`    Color Gamut:    ${light.model.colorGamut}`);
      console.log(`    Friends of Hue: ${light.model.friendsOfHue}`);
      console.log(`  Software Version: ${light.softwareVersion}`);
      console.log('  State:');
      console.log(`    On:         ${light.on}`);
      console.log(`    Reachable:  ${light.reachable}`);
      console.log(`    Brightness: ${light.brightness}`);
      console.log(`    Color mode: ${light.colorMode}`);
      console.log(`    Hue:        ${light.hue}`);
      console.log(`    Saturation: ${light.saturation}`);
      console.log(`    X/Y:        ${light.xy[0]}, ${light.xy[1]}`);
      console.log(`    Color Temp: ${light.colorTemp}`);
      console.log(`    Alert:      ${light.alert}`);
      console.log(`    Effect:     ${light.effect}`);
      console.log();
    }
  });
```

The following `Light` attributes are available:
* `id` - Numerical id of the light as registered on the bridge
* `name` - Configurable name for the light
* `type` - Type of light (e.g. Extended Color Light, Dimmable Light)
* `uniqueId` - Unique Id of the light
* `manufacturer` - Name of the manufacturer
* `modelId` - Model Id of the light, used for determining `LightModel`
* `model` - A `LightModel` object, containing details about the model (not available in other Node.js clients!)
* `softwareVersion` - Software version of the light

The following `Light` state is available:
* `on` - `true` if the light is on, `false` if not, configurable
* `reachable` - `true` if the light can be communicated with, `false` if not
* `brightness` - Configurable brightness of the light (value from 0 to 254)
* `colorMode` - Color mode light is respecting (e.g. ct, xy, hs)
* `hue` - Configurable hue of the light (value from 0 to 65535)
* `saturation` - Configurable saturation of the light, compliments `hue` (value from 0 to 254)
* `xy` - Configurable CIE x and y coordinates (value is an array containing x and y values)
* `colorTemp` - Configurable Mired Color temperature of the light (value from 153 to 500)
* `transitionTime` - Configurable temporary value which eases transition of an effect (value in seconds, 0 for instant, 5 for five seconds)
* `alert` - Configurable alert effect (e.g. none, select, lselect)
* `effect` - Configurable effect (e.g. none, colorloop)

There are additional `Light` state properties available for incrementing and
decrementing values:
* `incrementBrightness` - Increment or decrement brightness value
* `incrementHue` - Increment or decrement hue value
* `incrementSaturation` - Increment or decrement saturation value
* `incrementXy` - Increment or decrement xy values
* `incrementColorTemp` - Increment or decrement color temperature value

Huejay is the only Node.js client that maintains a list of Philips Hue supported
models. The `Light` `model` attribute returns a `LightModel` object which contains
additional details about the model:
* `id` - Model Id, typically the same value as `Light` `modelId`
* `manufacturer` - Manufacturer, typically the same value as `Light` `manufacturer`
* `name` - Name of the model / product (e.g. Hue Spot GU10)
* `type` - Type of light, typically the same value as `Light` `type`
* `colorGamut` - The supported color gamut of the light
* `friendsOfHue` - `true` if Friends of Hue, `false` if not

#### client.lights.getById - Get light by id

If only a single light is needed, `client.lights.getById` can be used to fetch
a light by its bridge assigned id. A `Light` object is returned if the light is
found, else a `huejay.Error` is thrown.

```js
client.lights.getById(1)
  .then(light => {
    console.log('Found light:');
    console.log(`  Light [${light.id}]: ${light.name}`);
  })
  .catch(error => {
    console.log('Could not find light');
    console.log(error.stack);
  });
```

#### client.lights.save - Save a light's attributes and state

After retrieving a `Light` object through previous commands, you can configure
the light and save its attributes and state. This allows you to change a
light's name, color, effect, and so on. You can set various properties on a
`Light` object, and save them via `client.lights.save`.

Huejay is smart and keeps track of changed attributes and state. The client
will only send updated values to the Philips Hue bridge, as sending all
configurable attributes and state can affect bridge and light performance.

To save a light, pass a `Light` object to `client.lights.save`. The light is
returned after saving for convenient chaining.

```js
client.lights.getById(3)
  .then(light => {
    light.name = 'New light name';

    light.brightness = 254;
    light.hue        = 32554;
    light.saturation = 254;

    return client.lights.save(light);
  })
  .then(light => {
    console.log(`Updated light [${light.id}]`);
  })
  .catch(error => {
    console.log('Something went wrong');
    console.log(error.stack);
  });
```

The following `Light` object attributes and state are configurable:
* `name`
* `on`
* `brightness`
* `hue`
* `saturation`
* `xy`
* `colorTemp`
* `transitionTime`
* `alert`
* `effect`
* `incrementBrightness`
* `incrementHue`
* `incrementSaturation`
* `incrementXy`
* `incrementColorTemp`

*Note: See further above for details on `Light` attributes and state*

#### client.lights.delete - Delete a light

Remove a light from the bridge with `client.lights.delete`. This will accept
either an id or a `Light` object.

```js
client.lights.delete(4)
  .then(() => {
    console.log('Light was deleted');
  })
  .catch(error => {
    console.log('Light may have been removed already, or does not exist');
    console.log(error.stack);
  });
```

### Groups

The Philips Hue bridge offers the convenience of grouping lights. Rather than
setting individual light brightness, color, and other options, you can apply the
same changes on a group and have it applied to all linked lights. Huejay
provides a complete interface for managing groups on the bridge.

Groups may also represent multisource luminaires. Philips offers several products
which consist of several color changing lights. Upon registering one of these
products with the bridge, a new group is created which represents the logical
grouping of the included lights. Huejay offers a simple means of retrieving
luminaire production information, as well as configuration of these high-end
fixtures.

#### client.groups.getAll - Get all groups

Use `client.groups.getAll` to retrieve all groups created on the bridge. This
command eventually returns an array of `Group` objects. See further below for
`Group` object information.

```js
client.groups.getAll()
  .then(groups => {
    for (let group of groups) {
      console.log(`Group [${group.id}]: ${group.name}`);
      console.log(`  Type: ${group.type}`);
      console.log(`  Class: ${group.class}`);
      console.log('  Light Ids: ' + group.lightIds.join(', '));
      console.log('  State:');
      console.log(`    On:         ${group.on}`);
      console.log(`    Brightness: ${group.brightness}`);
      console.log(`    Color mode: ${group.colorMode}`);
      console.log(`    Hue:        ${group.hue}`);
      console.log(`    Saturation: ${group.saturation}`);
      console.log(`    X/Y:        ${group.xy[0]}, ${group.xy[1]}`);
      console.log(`    Color Temp: ${group.colorTemp}`);
      console.log(`    Alert:      ${group.alert}`);
      console.log(`    Effect:     ${group.effect}`);

      if (group.modelId !== undefined) {
        console.log(`  Model Id: ${group.modelId}`);
        console.log(`  Unique Id: ${group.uniqueId}`);
        console.log('  Model:');
        console.log(`    Id:           ${group.model.id}`);
        console.log(`    Manufacturer: ${group.model.manufacturer}`);
        console.log(`    Name:         ${group.model.name}`);
        console.log(`    Type:         ${group.model.type}`);
      }

      console.log();
    }
  });
```

As demonstrated in the example above, group attributes and state are available
via `Group` objects.

Here are the following attributes available on `Group`:
* `id` - Group Id, generated automatically by the bridge
* `name` - Configurable name for the group
* `type` - Configurable type of group (e.g. LightGroup, Luminaire, LightSource, Room)
* `class` - When `type` is set to `Room`, a class (see below) is available and configurable (e.g. Living room, Office)
* `lightIds` - An array of light ids associated with the group
* `modelId` - Available only for multisource luminaires, this is the model id of the fixture
* `uniqueId` - Available only for multisource luminaires, this is the unique id of the fixture
* `model` - Available when `modelId` is present, a `GroupModel` object that contains details about the model

Similar to `Light` objects, `Group` objects provide state options for
the lights associated with the group:
* `on` - `true` for lights on, `false` if not, configurable
* `brightness` - Configurable brightness for the lights (value from 0 to 254)
* `colorMode` - Color mode group is respecting (e.g. ct, xy, hs)
* `hue` - Configurable hue of the lights (value from 0 to 65535)
* `saturation` - Configurable saturation of the lights, compliments `hue` (value from 0 to 254)
* `xy` - Configurable CIE x and y coordinates (value is an array containing x and y values)
* `colorTemp` - Configurable Mired Color temperature of the lights (value from 153 to 500)
* `transitionTime` - Configurable temporary value which eases transition of an effect (value in seconds, 0 for instant, 5 for five seconds)
* `alert` - Configurable alert effect (e.g. none, select, lselect)
* `effect` - Configurable effect (e.g. none, colorloop)
* `scene` - Configurable scene

Like `Light` objects, `Group` state properties are available for incrementing and
decrementing values:
* `incrementBrightness` - Increment or decrement brightness value
* `incrementHue` - Increment or decrement hue value
* `incrementSaturation` - Increment or decrement saturation value
* `incrementXy` - Increment or decrement xy values
* `incrementColorTemp` - Increment or decrement color temperature value

Huejay maintains a list of Philips Hue supported luminaire models. The `Group`
`model` attribute returns a `GroupModel` object. This object contains more
information about the model:
* `id` - Model Id, typically the same value as `Group` `modelId`
* `manufacturer` - Manufacturer of the model (e.g. Philips)
* `name` - Name of the model / product (e.g. Hue Beyond Table)
* `type` - Type of group, typically the same value as `Group` `type`

When a `Group`'s `type` is `Room`, the following classes can be associated with the group:

| Class        |              |
| ------------ | ------------ |
| Living room  | Gym          |
| Kitchen      | Hallway      |
| Dining       | Toilet       |
| Bathroom     | Front door   |
| Bedroom      | Garage       |
| Kids bedroom | Terrace      |
| Nursery      | Garden       |
| Recreation   | Driveway     |
| Office       | Other        |
| Carport      |              |

*Note: The `client.groups.getAll` command does not return special group 0.
See `client.groups.getById` for instructions on retrieving this special group.*

#### client.groups.getById - Get group by id

Need a specific group? `client.groups.getById` accepts a group id. If a group
exists with that id, a `Group` object is returned, else a `huejay.Error` is
thrown.

```js
client.groups.getById(3)
  .then(group => {
    console.log('Found group:');
    console.log(`  Group [${group.id}]: ${group.name}`);
  })
  .catch(error => {
    console.log('Could not find group');
    console.log(error.stack);
  });
```

A **special group** is available which is accessible via group id **0**. This
group always contains all light ids registered on the bridge. Use this group
to control all lights at once.

```js
client.groups.getById(0)
  .then(group => {
    console.log('Special group 0');
    console.log('  Light Ids:', group.lightIds.join(', '));
  });
```

#### client.groups.create - Create a group

Creating a group is easy using Huejay. Instantiate a new `client.groups.Group`
object and set both a name and list of light ids.

```js
let group = new client.groups.Group;
group.name     = 'New group';
group.lightIds = [2, 4, 5];

client.groups.create(group)
  .then(group => {
    console.log(`Group [${group.id}] created`);
  })
  .catch(error => {
    console.log(error.stack);
  });
```

*Note: State is not saved on group creation. You must save the group after
creation if state is configured.*

#### client.groups.save - Save a group's attributes and state

You can modify a `Group`'s attributes and state after creation/retrieval, and
then apply the changes on the bridge. Like `Light` objects, Huejay will only
apply deltas when saving groups.

To apply changes, use `client.groups.save`. The `Group` object is returned upon
save completion.

```js
client.groups.getById(6)
  .then(group => {
    group.name       = 'Brand new name';
    group.lightIds   = [4, 6, 8];

    group.on         = true;
    group.brightness = 254;
    group.effect     = 'colorloop';

    return client.groups.save(group);
  })
  .then(group => {
    console.log(`Group [${group.id}] was saved`);
  })
  .catch(error => {
    console.log(error.stack);
  });
```

The following `Group` object attributes and state are configurable:
* `name`
* `lightIds`
* `on`
* `brightness`
* `hue`
* `saturation`
* `xy`
* `colorTemp`
* `transitionTime`
* `alert`
* `effect`
* `incrementBrightness`
* `incrementHue`
* `incrementSaturation`
* `incrementXy`
* `incrementColorTemp`

#### client.groups.delete - Delete a group

To delete a group from the bridge, pass a group id or `Group` object to
`client.groups.delete`.

```js
client.groups.delete(3)
  .then(() => {
    console.log('Group was deleted');
  })
  .catch(error => {
    console.log('Group may have been removed already, or does not exist');
    console.log(error.stack);
  });
```

*Note: It is not possible to delete multisource groups. Expect a `huejay.Error`
to be thrown if attempting to do so.*

### Schedules

The Huejay API for managing schedules is not yet finalized.

You can get a sneak peek of schedule management through [examples](examples/schedules).

Expect finalization of the API in release v0.18.0.

### Scenes

Huejay supports managing scenes on the Philips Hue. Scenes are the best way of
storing and recalling commonly used light configurations in your home.

*Note: To recall a scene, set the `scene` attribute on a `Group` object and save.*

#### client.scenes.getAll - Retrieve all scenes

Retrieves all scenes from the bridge. This command returns an array of `Scene`
objects.

```js
client.scenes.getAll()
  .then(scenes => {
    for (let scene of scenes) {
      console.log(`Scene [${scene.id}]: ${scene.name}`);
      console.log('  Lights:', scene.lightIds.join(', '));
      console.log();
    }
  });
```

`Scene` objects are composed of the following attributes:
* `id` - User/application defined scene id (e.g. my-scene-id)
* `name` - Configurable name
* `lightIds` - Configurable array of associated light ids
* `owner` - User who created the scene
* `recycle` - Configurable option which will auto delete the scene
* `locked` - If `true`, scene is not deletable as it is being used by another resource
* `appData` - A configurable object consisting of `version` and `data` properties
* `picture` - Future field, probably storing picture URL
* `lastUpdated` - Date when scene was last updated
* `captureLightState` - Set to `true` to capture current light state for the scene
* `transitionTime` - Always `null` on access, but can be configured

The following methods are available on `Scene` objects:
* `getLightState(lightId)` - Get light state by light id. Values only available by `getById`.
* `setLightState(lightId, {property: 'value'})` - Set light state by light id.

#### client.scenes.getById - Retrieve scene by id

Retrieve a single scene by id. If the scene is not available, a `huejay.Error`
is thrown.

```js
client.scenes.getById('123456abcdef')
  .then(scene => {
    console.log(`Scene [${scene.id}]: ${scene.name}`);
    console.log('  Lights:', scene.lightIds.join(', '));
    console.log();
  })
  .catch(error => {
    console.log(error.stack);
  });
```

#### client.scenes.create - Create a scene

Scene creation is a breeze. Instantiate a new `client.scenes.Scene`, set a name,
lightIds, other attributes, and pass to `client.scenes.create`.

```js
let scene = new client.scenes.Scene;
scene.name           = 'Scene name';
scene.lightIds       = [1, 2, 3];
scene.recycle        = false;
scene.appData        = {version: 1, data: 'optional app data'};
scene.transitionTime = 2;

client.scenes.create(scene)
  .then(scene => {
    console.log(`Scene [${scene.id}] created...`);

    console.log('  Name:', scene.name);
    console.log('  Lights:', scene.lightIds.join(', '));
    console.log('  Owner:', scene.owner);
    console.log('  Recycle:', scene.recycle);
    console.log('  Locked:', scene.locked);
    console.log('  App data:', scene.appData);
    console.log('  Picture:', scene.picture);
    console.log('  Last Updated:', scene.lastUpdated);
    console.log('  Version:', scene.version);
  })
  .catch(error => {
    console.log(error.stack);
  });
```

These `Scene` object attributes can be configured for creation:
* `name`
* `lightIds`
* `recycle`
* `appData`
* `captureLightState`

#### client.scenes.save - Save a scene

`Scene` objects can be reconfigured and saved using `client.scenes.save`. Light
states can be configured with this command.

```js
client.scenes.getById('123456abcdef')
  .then(scene => {

    scene.name = 'New scene name';
    scene.lightIds = [9, 10];

    // Set light state for light id 9
    scene.setLightState(9, {
      brightness: 254,
      colorTemp:  250,
    });

    // Set light state for light id 10
    scene.setLightState(10, {
      brightness: 128,
      colorTemp:  300,
      effect:     'colorloop',
    });

    return client.scenes.save(scene)
  })
  .then(scene => {
    console.log(`Scene saved...`);
  })
  .catch(error => {
    console.log(error.stack);
  });
```

#### client.scenes.delete - Delete a scene

To delete a `Scene` object, provide a scene id or `Scene` object to
`client.scenes.delete`.

```js
client.scenes.delete('123456abcdef')
  .then(() => {
    console.log('Scene was deleted');
  })
  .catch(error => {
    console.log('Scene may have been removed already, or does not exist');
    console.log(error.stack);
  });
```

*Note: Scenes being used or referenced by other resources may not be deleted.*

### Sensors

The Huejay API for managing sensors is not yet finalized.

You can get a sneak peek of sensor management through [examples](examples/sensors).

Expect finalization of the API in release v0.17.0.

#### client.sensors.scan - Scan for new sensors

#### client.sensors.getNew - Get new sensors

#### client.sensors.getAll - Get all sensors

#### client.sensors.getById - Get sensor by id

#### client.sensors.create - Create a sensor

#### client.sensors.save - Save a sensor

#### client.sensors.delete - Delete a sensor

### Rules

The Huejay API for managing rules is not yet finalized.

You can get a sneak peek of rule management through [examples](examples/rules).

Expect finalization of the API in release v0.19.0.

### Time Zones

The Philips Hue bridge supports configuring a local time zone. This is useful
for scheduling functions. Numerous time zones are registered on the bridge for
retrieval.

#### client.timeZones.getAll - Get all time zones

You can retrieve a list of supported time zones by calling
`client.timeZones.getAll`. This will return an array of string values.

```js
client.timeZones.getAll()
  .then(timeZones => {
    for (let timeZone of timeZones) {
      console.log(timeZone);
    }
  });
```

## Examples

Want to see more examples? View them in the [examples](examples) directory included
in this repository.

## Logo

Huejay's initial logo was designed by scorpion6 on Fiverr. Font used is Lato Bold.

## License

This software is licensed under the MIT License. [View the license](LICENSE).

Copyright © 2015 [Michael K. Squires](http://sqmk.com)

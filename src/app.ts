import Domoticz from './domoticz/domoticz';
var domoticz = new Domoticz({trace: true});
domoticz.connect('192.168.1.3');
import mqtt         = require('mqtt');
import events       = require('events');
import util         = require('util');

export interface DomoticzOptions
{
    trace: boolean
}

export interface DomoticzMqttMessage
{
    /**
     * Battery percentage
     */
    Battery : number;

    /**
     * Some number
     */
    RSSI : number;


   /**
    * Unique device identifier. 
    * Note that there may be several properties per device defined by idx
    */
   "id" : string;

   /**
    * Unique device property identifier
    */
   idx : number;

   /**
    * Name of device
    */
   name : string;

   /**
    * Numeric value. Either this or svalue is used.
    * NValue is used for switches and levels. On/Off = 0/1, Dimmer = 0-15
    */
   nvalue : number;
   
   /**
    * String value. Either this or nvalue is used
    */
   svalue1 : string;

   /**
    * Device type, e.g. Light/Switch
    */
   dtype : string;
   /**
    * Type of property, e.g. "SetPoint".
    * This can e seen as a subcategory to dtype
    */
   stype : string;

   /**
    * Unit
    */
    unit: number;

    /**
     * If stype = switch, switchType can 
     * be used to define the type of switch, e.g. "On/Off"
     */
    switchType : string;
}

export default class Domoticz extends events.EventEmitter
{
    private _mqtt : mqtt.Client;
    private _options : DomoticzOptions;
    public constructor(options : DomoticzOptions) {
        super();
        events.EventEmitter.call(this); // inherit from EventEmitter
        this._options = options || {
            trace: true
        };
    }

    public connect(host)
    {
        this._mqtt = mqtt.connect("mqtt://" + host);
        this._mqtt.on('connect', function () {
            this._mqtt.subscribe('domoticz/out');
        }.bind(this));
        // Incoming MQTT Message
        this._mqtt.on('message', function (topic, message) {
            let jsonData = JSON.parse(message)
            if (this._options.trace) { console.log('MQTT IN: ' + message.toString()) };
            this.onMqttData(jsonData);
        }.bind(this));

        // OnConnect
        this._mqtt.on('connect', function () {
            this._mqtt.subscribe('domoticz/out');
            if (this._options.trace) { 
                console.log("Domoticz MQTT: connected");
            };
            this._mqtt.publish('domoticz/in', JSON.stringify( { 'command': 'getdeviceinfo', 'idx': 26 }))
            this.emit('connect');
        }.bind(this));
    
        // OnError
        this._mqtt.on('error', function (error) {
            if (this._options.trace) { console.log("ERROR: " + error.toString()) };
            this.emit('error', error.toString());
        }.bind(this));

        // OnExit
        process.on( "SIGINT", function() {
            this._mqtt.end();
        }.bind(this));

    }

    private onMqttData(msg : DomoticzMqttMessage)
    {

    }

}

// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { IBase } from "../../Interfaces/Contracts/IBase";
import { IEnvelope } from "../../Interfaces/Telemetry/IEnvelope";
import { dataSanitizeString } from "./DataSanitizer";
import { FieldType } from "../../Enums";
import { IDiagnosticLogger, toISOString } from "@microsoft/applicationinsights-core-js";
import { strNotSpecified } from "../../Constants";

export class Envelope implements IEnvelope {

    /**
     * The data contract for serializing this object.
     */
    public aiDataContract: any;

    /**
     * Envelope version. For internal use only. By assigning this the default, it will not be serialized within the payload unless changed to a value other than #1.
     */
    public ver: number; /* 1 */

    /**
     * Type name of telemetry data item.
     */
    public name: string;
 
    /**
     * Event date time when telemetry item was created. This is the wall clock time on the client when the event was generated. There is no guarantee that the client's time is accurate. This field must be formatted in UTC ISO 8601 format, with a trailing 'Z' character, as described publicly on https://en.wikipedia.org/wiki/ISO_8601#UTC. Note: the number of decimal seconds digits provided are variable (and unspecified). Consumers should handle this, i.e. managed code consumers should not use format 'O' for parsing as it specifies a fixed length. Example: 2009-06-15T13:45:30.0000000Z.
     */
    public time: string;
 
    /**
     * Sampling rate used in application. This telemetry item represents 1 / sampleRate actual telemetry items.
     */
    public sampleRate: number; /* 100.0 */
 
    /**
     * Sequence field used to track absolute order of uploaded events.
     */
    public seq: string;
 
    /**
     * The application's instrumentation key. The key is typically represented as a GUID, but there are cases when it is not a guid. No code should rely on iKey being a GUID. Instrumentation key is case insensitive.
     */
    public iKey: string;
 
    /**
     * Key/value collection of context properties. See ContextTagKeys for information on available properties.
     */
    public tags: any; /* {} */
 
    /**
     * Telemetry data item.
     */
    public data: IBase;
 
    /**
     * Constructs a new instance of telemetry data.
     */
    constructor(logger: IDiagnosticLogger, data: IBase, name: string) {
        let _self = this;
        _self.ver = 1;
        _self.sampleRate = 100.0;
        _self.tags = {};
        _self.name = dataSanitizeString(logger, name) || strNotSpecified;
        _self.data = data;
        _self.time = toISOString(new Date());

        _self.aiDataContract = {
            time: FieldType.Required,
            iKey: FieldType.Required,
            name: FieldType.Required,
            sampleRate: () => {
                return (this.sampleRate === 100) ? FieldType.Hidden : FieldType.Required;
            },
            tags: FieldType.Required,
            data: FieldType.Required
        };
    }
}
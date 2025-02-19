"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filters = void 0;
const index_1 = require("../../index");
class Filters {
    player;
    manager;
    rest;
    filters;
    constructor(player) {
        this.player = player;
        this.rest = player.node.rest;
        this.manager = player.manager;
        this.filters = {
            volume: player.get("Fvolume") || undefined,
            equalizer: player.get("equalizer") || undefined,
            karaoke: player.get("karaoke") || undefined,
            timescale: player.get("timescale") || undefined,
            tremolo: player.get("tremolo") || undefined,
            vibrato: player.get("vibrato") || undefined,
            rotation: player.get("rotation") || undefined,
            distortion: player.get("distortion") || undefined,
            channelMix: player.get("channelMix") || undefined,
            lowPass: player.get("lowPass") || undefined,
        };
    }
    setFilter(filterName, value) {
        this.player.set(filterName, value);
        this.filters[filterName] = value;
        this.updateFiltersFromRest();
        return this;
    }
    setVolume(volume) {
        (0, index_1.validateProperty)(volume, (value) => value === undefined || (typeof value === 'number' && value >= 0 && value <= 100), "Moonlink.js > Filters#setVolume - volume not a number or out of range");
        return this.setFilter("volume", volume);
    }
    setEqualizer(equalizer) {
        (0, index_1.validateProperty)(equalizer, (value) => {
            if (value === undefined)
                return true;
            if (!Array.isArray(value))
                return false;
            return value.every(eq => typeof eq.band === 'number' &&
                typeof eq.gain === 'number');
        }, "Moonlink.js > Filters#setEqualizer - equalizer not an array of Equalizer objects or undefined");
        return this.setFilter("equalizer", equalizer);
    }
    setKaraoke(karaoke) {
        (0, index_1.validateProperty)(karaoke, (value) => {
            if (value === undefined)
                return true;
            if (typeof value !== 'object')
                return false;
            const { level, monoLevel, filterBand, filterWidth } = value;
            return ((level === undefined || typeof level === 'number') &&
                (monoLevel === undefined || typeof monoLevel === 'number') &&
                (filterBand === undefined || typeof filterBand === 'number') &&
                (filterWidth === undefined || typeof filterWidth === 'number'));
        }, "Moonlink.js > Filters#setKaraoke - karaoke not a valid Karaoke object or undefined");
        return this.setFilter("karaoke", karaoke);
    }
    setTimescale(timescale) {
        (0, index_1.validateProperty)(timescale, (value) => {
            if (value === undefined)
                return true;
            if (typeof value !== 'object')
                return false;
            const { speed, pitch, rate } = value;
            return ((speed === undefined || typeof speed === 'number') &&
                (pitch === undefined || typeof pitch === 'number') &&
                (rate === undefined || typeof rate === 'number'));
        }, "Moonlink.js > Filters#setTimescale - timescale not a valid Timescale object or undefined");
        return this.setFilter("timescale", timescale);
    }
    setTremolo(tremolo) {
        (0, index_1.validateProperty)(tremolo, (value) => {
            if (value === undefined)
                return true;
            if (typeof value !== 'object')
                return false;
            const { frequency, depth } = value;
            return ((frequency === undefined || typeof frequency === 'number') &&
                (depth === undefined || typeof depth === 'number'));
        }, "Moonlink.js > Filters#setTremolo - tremolo not a valid Tremolo object or undefined");
        return this.setFilter("tremolo", tremolo);
    }
    setVibrato(vibrato) {
        (0, index_1.validateProperty)(vibrato, (value) => {
            if (value === undefined)
                return true;
            if (typeof value !== 'object')
                return false;
            const { frequency, depth } = value;
            return ((frequency === undefined || typeof frequency === 'number') &&
                (depth === undefined || typeof depth === 'number'));
        }, "Moonlink.js > Filters#setVibrato - vibrato not a valid Vibrato object or undefined");
        return this.setFilter("vibrato", vibrato);
    }
    setRotation(rotation) {
        (0, index_1.validateProperty)(rotation, (value) => {
            if (value === undefined)
                return true;
            if (typeof value !== 'object')
                return false;
            const { rotationHz } = value;
            return (rotationHz === undefined || typeof rotationHz === 'number');
        }, "Moonlink.js > Filters#setRotation - rotation not a valid Rotation object or undefined");
        return this.setFilter("rotation", rotation);
    }
    setDistortion(distortion) {
        (0, index_1.validateProperty)(distortion, (value) => {
            if (value === undefined)
                return true;
            if (typeof value !== 'object')
                return false;
            const { sinOffset, sinScale, cosOffset, cosScale, tanOffset, tanScale, offset, scale } = value;
            return ((sinOffset === undefined || typeof sinOffset === 'number') &&
                (sinScale === undefined || typeof sinScale === 'number') &&
                (cosOffset === undefined || typeof cosOffset === 'number') &&
                (cosScale === undefined || typeof cosScale === 'number') &&
                (tanOffset === undefined || typeof tanOffset === 'number') &&
                (tanScale === undefined || typeof tanScale === 'number') &&
                (offset === undefined || typeof offset === 'number') &&
                (scale === undefined || typeof scale === 'number'));
        }, "Moonlink.js > Filters#setDistortion - distortion not a valid Distortion object or undefined");
        return this.setFilter("distortion", distortion);
    }
    setChannelMix(channelMix) {
        (0, index_1.validateProperty)(channelMix, (value) => {
            if (value === undefined)
                return true;
            if (typeof value !== 'object')
                return false;
            const { leftToLeft, leftToRight, rightToLeft, rightToRight } = value;
            return ((leftToLeft === undefined || typeof leftToLeft === 'number') &&
                (leftToRight === undefined || typeof leftToRight === 'number') &&
                (rightToLeft === undefined || typeof rightToLeft === 'number') &&
                (rightToRight === undefined || typeof rightToRight === 'number'));
        }, "Moonlink.js > Filters#setChannelMix - channelMix not a valid ChannelMix object or undefined");
        return this.setFilter("channelMix", channelMix);
    }
    setLowPass(lowPass) {
        (0, index_1.validateProperty)(lowPass, (value) => {
            if (value === undefined)
                return true;
            if (typeof value !== 'object')
                return false;
            const { smoothing } = value;
            return (smoothing === undefined || typeof smoothing === 'number');
        }, "Moonlink.js > Filters#setLowPass - lowPass not a valid LowPass object or undefined");
        return this.setFilter("lowPass", lowPass);
    }
    resetFilters() {
        Object.keys(this.filters).forEach(key => {
            this.setFilter(key, undefined);
        });
        return this;
    }
    async updateFiltersFromRest() {
        const dataToUpdate = {
            guildId: this.player.guildId,
            data: {
                filters: this.filters
            }
        };
        await this.rest.update(dataToUpdate);
        return true;
    }
}
exports.Filters = Filters;
//# sourceMappingURL=Filters.js.map
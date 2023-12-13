import { EventEmitter } from "node:events";
import { Structure } from "../..";
import { Players, Nodes } from "../@Utils/Structure";
import {
    INode,
    IOptions,
    VoicePacket,
    SearchResult,
    SearchQuery
} from "../@Typings";

export class MoonlinkManager extends EventEmitter {
    public readonly _nodes: INode[];
    public readonly _SPayload: Function;
    public readonly players: Players;
    public readonly nodes: Nodes;
    public readonly version: number = require("../../index").version;
    public options: IOptions;
    public initiated: boolean = false;

    constructor(nodes: INode[], options: IOptions, SPayload: Function) {
        super();
        this._nodes = nodes;
        this._SPayload = SPayload;
        this.players = new Structure.get("Players");
        this.nodes = new Structure.get("Nodes");
        this.options = options;
        this.options.clientName
            ? (this.options.clientName = `Moonlink/${this.manager.version}`)
            : null;
    }
    public init(clientId?: number): this {
        if (this.initiated) return this;
        if (!clientId && !this.options.clientId)
            throw new TypeError(
                '[ @Moonlink/Manager ]: "clientId" option is required.'
            );
        this.clientId = this.options.clientId;
        Structure.init(this);
        this.nodes.init();
        this.players.init();
        this.initiated = true;
        return this;
    }
    public async search(options: string | SearchQuery): Promise<SearchResult> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!options) {
                    throw new Error(
                        "[ @Moonlink/Manager ]: the search option has to be in string format or in an array"
                    );
                }

                let query;
                let source;

                if (typeof options === "object") {
                    query = options.query;
                    source = options.source;
                } else {
                    query = options;
                }

                if (source && typeof source !== "string") {
                    throw new Error(
                        "[ @Moonlink/Manager ]: the source option has to be in string format"
                    );
                }

                if (typeof query !== "string" && typeof query !== "object") {
                    throw new Error(
                        "[ @Moonlink/Manager ]: (search) the search option has to be in string or array format"
                    );
                }

                const sources = {
                    youtube: "ytsearch",
                    youtubemusic: "ytmsearch",
                    soundcloud: "scsearch"
                };

                let searchIdentifier =
                    query.startsWith("http://") || query.startsWith("https://")
                        ? query
                        : source
                        ? sources[source]
                            ? `${sources[source]}:${query}`
                            : `${source}:${query}`
                        : `ytsearch:${query}`;

                const params = new URLSearchParams({
                    identifier: searchIdentifier
                });
                const res: any = await this.nodes
                    .sortByUsage("memory")[0]
                    .request("loadtracks", params);
                if (["error", "empty"].includes(res.loadType)) {
                    this.emit(
                        "debug",
                        "[ @Moonlink/Manager ]: not found or there was an error loading the track"
                    );
                    return resolve(res);
                }

                if (["track"].includes(res.loadType)) {
                    res.data = [res.data];
                }

                if (["playlist"].includes(res.loadType)) {
                    res.playlistInfo = {
                        duration: res.data.tracks.reduce(
                            (acc, cur) => acc + cur.info.length,
                            0
                        ),
                        name: res.data.info.name,
                        selectedTrack: res.data.info.selectedTrack
                    };
                    res.pluginInfo = res.data.pluginInfo;
                    res.data = [...res.data.tracks];
                }

                const tracks = res.data.map(
                    x => new (Structure.get("MoonlinkTrack"))(x)
                );

                resolve({
                    ...res,
                    tracks
                });
            } catch (error) {
                this.emit(
                    "debug",
                    "[ @Moonlink/Manager ]: An error occurred: " + error.message
                );
                reject(error);
            }
        });
    }
    public packetUpdate(packet: VoicePacket): void {
        const { t, d } = packet;
        if (!["VOICE_STATE_UPDATE", "VOICE_SERVER_UPDATE"].includes(t)) return;

        const update: any = d;
        const guildId = update.guild_id;
        const player: MoonlinkPlayers = this.players.get(guildId);

        if (!update || (!update.token && !update.session_id)) return;

        if (t === "VOICE_SERVER_UPDATE") {
            this.players.handleVoiceServerUpdate(update, guildId);
        }

        if (t === "VOICE_STATE_UPDATE" && update.user_id === this.clientId) {
            if (!player) return;

            if (!update.channel_id) {
                this.players.handlePlayerDisconnect(player, guildId);
            }

            if (
                update.channel_id &&
                update.channel_id !== player.voiceChannel
            ) {
                this.players.handlePlayerMove(
                    player,
                    update.channel_id,
                    player.voiceChannel,
                    guildId
                );
            }

            this.players.updateVoiceStates(guildId, update);
            this.players.attemptConnection(guildId);
        }
    }
}

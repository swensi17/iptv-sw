import { Collection } from '@freearhey/core'
import { Stream } from '../models'

type PlaylistOptions = {
  public: boolean
}

export class Playlist {
  streams: Collection
  options: {
    public: boolean
  }

  constructor(streams: Collection, options?: PlaylistOptions) {
    this.streams = streams
    this.options = options || { public: false }
  }

  toString() {
    let output = '#EXTM3U\n'

    this.streams.forEach((stream: Stream) => {
      output += stream.toString(this.options) + '\n'
    })

    return output
  }
}

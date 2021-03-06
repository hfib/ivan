import {
  ArgsOf,
  Client,
  On
} from "@typeit/discord";

import { Pixabay } from "../Pixabay";
import { noop, random_item } from "../Utils";

const INVITE = /(discord\.(gg|io|me|li)|discord(app)?\.com\/invite)\/[\w\d]+/g;
const MAX_COUNT = 1;

let cooldown = {};

setInterval(() => {
  for(let channel in cooldown) {
    for(let user in cooldown[channel]) {
      let count = cooldown[channel][user];
      if(count > 0) cooldown[channel][user] = --count;
    }
  }
}, 2000);

export abstract class OnReady {
  @On("message")
  async message([m]: ArgsOf<"message">, client: Client) {
    if(m.author.bot) return;

    if(!cooldown[m.channel.id]) {
      cooldown[m.channel.id] = {};
      cooldown[m.channel.id][m.author.id] = 0;
    }

    let count = cooldown[m.channel.id][m.author.id] || 0;

    if(count > MAX_COUNT) {
      m.delete().catch(noop);
      return
    }

    cooldown[m.channel.id][m.author.id] = ++count;

    if(m.content.match(INVITE)) {
      m.delete().catch(noop);
      return
    }

    if(m.content.toLocaleLowerCase().indexOf("nazi") != -1) {
      if(Pixabay.instance.ready) {
        let adolf = await Pixabay.instance.getImages("fascism");

        /* Думаю можно было как-то сделать менее по-петушиному,
         * но вроде и так сойдёт.
         */
        if(adolf.hits) {
          let current = random_item(adolf.hits);
          let msg = await m.channel.send(current.largeImageURL);

          setTimeout(() => {
            msg.delete().catch(noop);
          }, 5000);
        }
      }
    }
  }

  @On("messageUpdate")
  async updateMessage([_, n]: ArgsOf<"messageUpdate">, client: Client) {
    if(n.content.match(INVITE)) {
      n.delete().catch(noop);
    }
  }
}

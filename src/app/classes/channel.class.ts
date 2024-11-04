// channel.model.ts
export class Channel {
    id: string = '';
    title: string = '';
    creator: {
        name: string;
        id: string;
    } = { name: '', id: '' };
    members: Array<{ 
        name: string; 
        id: string;
        img: string;
        isOnline: boolean;
    }> = [];
    description: string = '';
    isPublic: boolean = true;

    constructor(init?: Partial<Channel>) {
        Object.assign(this, init);
    }
}


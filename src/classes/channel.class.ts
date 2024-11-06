export class Channel {
    id: string = '';
    title: string = '';
    messages: Array<{}>= []
    membersId: Array<string> = [];
    type: string = '';
    description: string = '';
    isPublic: boolean = true;

    constructor(init?: Partial<Channel>) {
        Object.assign(this, init);
    }
}


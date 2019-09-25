import elt from "./elt";
import { IAction, IComment, IFormElements, ITalk, ITalkDOM } from "./interfaces";

export default class TalkDOM implements ITalkDOM {
    public readonly dom: HTMLElement;
    private readonly commentDOMs: {[id: string]: HTMLParagraphElement};
    private readonly comments: HTMLDivElement;

    constructor(talk: ITalk, dispatch: (action: IAction) => void) {
        const { dom, comments } = renderTalk(talk, dispatch);
        this.dom = dom;
        this.comments = comments;
        this.commentDOMs = Object.create(null);
        this.syncstate(talk);
    }

    public syncstate(talk: ITalk) {
        // remove deleted comments
        const commentIds = talk.comments.map((c) => {
            return c.author + "~~" + c.message;
        });
        Object.keys(this.commentDOMs).filter((t) => {
            return !(t in commentIds);
        }).forEach((t) => {
            this.commentDOMs[t].remove();
        });
        // add new comments
        talk.comments.filter((c) => {
            const id = c.author + "~~" + c.message;
            return !(id in Object.keys(this.commentDOMs));
        }).forEach((c) => {
            const comment = renderComment(c);
            this.comments.appendChild(comment);
            this.commentDOMs[c.author + "~~" + c.message] = comment;
        });
    }

}

function renderTalk(talk: ITalk, dispatch: (action: IAction) => void) {
    const comments = document.createElement("div");
    return {
        comments,
        dom: elt(
            "section", {className: "talk"},
            elt(
                "h2", null, talk.title, " ",
                elt("button", {
                    type: "button",
                    onclick() {
                        dispatch({type: "deleteTalk", talk: talk.title});
                    },
                }, "Delete"),
            ),
            elt(
                "div", null, "by ",
                elt("strong", null, talk.presenter),
            ),
            elt("p", null, talk.summary),
            comments,
            elt("form", {
                onsubmit(event: Event) {
                    event.preventDefault();
                    const form = event.target as HTMLFormElement;
                    dispatch({
                        message: (form.elements as IFormElements).comment.value,
                        talk: talk.title,
                        type: "newComment",
                    });
                    form.reset();
                },
            },
            elt("input", {type: "text", name: "comment"}), " ",
            elt("button", {type: "submit"}, "Add comment")),
        ),
    };
}

function renderComment(comment: IComment): HTMLParagraphElement {
    return elt(
        "p", {className: "comment"},
        elt("strong", null, comment.author),
        ": ", comment.message,
    ) as HTMLParagraphElement;
}

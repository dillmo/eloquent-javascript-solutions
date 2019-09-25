import elt from "./elt";
import {IAction, IDeleteTalkAction, INewCommentAction,
    INewTalkAction, ISetTalksAction, ISetUserAction, IState, ITalk} from "./interfaces";
import TalkDOM from "./TalkDOM";

function handleAction(state: IState, action: IAction) {
    if (isSetUserAction(action)) {
        localStorage.setItem("userName", action.user);
        return Object.assign({}, state, {user: action.user});
    }
    if (isSetTalksAction(action)) {
        return Object.assign({}, state, {talks: action.talks});
    }
    if (isNewTalkAction(action)) {
        fetchOK(talkURL(action.title), {
            body: JSON.stringify({
                presenter: state.user,
                summary: action.summary,
            }),
            headers: {"Content-Type": "application.json"},
            method: "PUT",
        });
    } else if (isTalkAction(action)) {
        fetchOK(talkURL(action.talk), {method: "DELETE"}).catch(reportError);
    } else if (isNewCommentAction(action)) {
        fetchOK(talkURL(action.talk) + "/comments", {
            body: JSON.stringify({
                author: state.user,
                message: action.message,
            }),
            headers: {"Content-Type": "application/json"},
            method: "POST",
        }).catch(reportError);
    }
    return state;
}

function isSetUserAction(action: IAction): action is ISetUserAction {
    return action.type === "setUser";
}

function isSetTalksAction(action: IAction): action is ISetTalksAction {
    return action.type === "setTalks";
}

function isNewTalkAction(action: IAction): action is INewTalkAction {
    return action.type === "newTalk";
}

function isTalkAction(action: IAction): action is IDeleteTalkAction {
    return action.type === "deleteTalk";
}

function isNewCommentAction(action: IAction): action is INewCommentAction {
    return action.type === "newComment";
}

function fetchOK(url: string, options: RequestInit) {
    return fetch(url, options).then((response) => {
        if (response.status < 400) {
            return response;
        }
        throw new Error(response.statusText);
    });
}

function talkURL(title: string) {
    return "talks/" + encodeURIComponent(title);
}

function reportError(error: any) {
    alert(String(error));
}

function renderUserField(name: string, dispatch: (action: IAction) => void) {
    return elt("label", {}, "Your name: ", elt("input", {
        type: "text",
        value: name,
        onchange(event: Event) {
            if (event.target instanceof HTMLInputElement) {
                dispatch({type: "setUser", user: event.target.value});
            }
        },
    }));
}

function renderTalkForm(dispatch: (action: IAction) => void) {
    const title = elt("input", {type: "text"}) as HTMLInputElement;
    const summary = elt("input", {type: "text"}) as HTMLInputElement;
    return elt (
        "form", {
            onsubmit(event: Event) {
                event.preventDefault();
                dispatch({
                    summary: summary.value,
                    title: title.value,
                    type: "newTalk",
                });
                (event.target as HTMLFormElement).reset();
            },
        },
        elt("h3", null, "Submit a Talk"),
        elt("label", null, "Title: ", title),
        elt("label", null, "Summary: ", summary),
        elt("button", {type: "submit"}, "Submit"),
    );
}

async function pollTalks(update: (talks: ITalk[]) => void) {
    let tag: string | undefined;
    for (;;) {
        let response: Response;

        try {
            response = await fetchOK("/talks", {
                headers: {"If-None-Match": tag || "-1", "Prefer": "wait=90"},
            });
        } catch (e) {
            // tslint:disable-next-line: no-console
            console.log("Request failed: " + e);
            await new Promise((resolve) => setTimeout(resolve, 500));
            continue;
        }
        if (response.status === 304) {
            continue;
        }
        tag = response.headers.get("ETag") as string;
        update(await response.json());
    }
}

class SkillShareApp {
    public readonly dom: HTMLDivElement;
    private readonly dispatch: (action: IAction) => void;
    private readonly talkDOM: HTMLDivElement;
    private talks?: ITalk[];
    private talkDOMs: {[title: string]: TalkDOM};

    constructor(state: IState, dispatch: (action: IAction) => void) {
        this.dispatch = dispatch;
        this.talkDOM = elt("div", null) as HTMLDivElement;
        this.dom = elt("div", null,
                       renderUserField(state.user, dispatch),
                       this.talkDOM,
                       renderTalkForm(dispatch)) as HTMLDivElement;
        this.talkDOMs = Object.create(null);
        this.syncState(state);
    }

    public syncState(state: IState): void {
        if (state.talks !== this.talks) {
            this.talkDOM.textContent = "";
            for (const talk of state.talks) {
                let td = this.talkDOMs[talk.title];
                if (td) {
                    td.syncstate(talk);
                } else {
                    td = new TalkDOM(talk, this.dispatch);
                    this.talkDOMs[talk.title] = td;
                }
                this.talkDOM.appendChild(td.dom);
            }
            this.talks = state.talks;
        }
    }
}

function runApp() {
    const user = localStorage.getItem("userName") || "Anon";
    let state: IState;
    let app: SkillShareApp;
    function dispatch(action: IAction) {
        state = handleAction(state, action);
        app.syncState(state);
    }

    pollTalks((talks) => {
        if (!app) {
            state = {user, talks};
            app = new SkillShareApp(state, dispatch);
            document.body.appendChild(app.dom);
        } else {
            dispatch({type: "setTalks", talks});
        }
    }).catch(reportError);
}

runApp();

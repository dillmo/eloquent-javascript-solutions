export default function elt(type: string, props: object | null, ...children: Array<HTMLElement | string>) {
    const dom: HTMLElement = document.createElement(type);
    if (props) {
        Object.assign(dom, props);
    }
    for (const child of children) {
        if (typeof child !== "string") {
            dom.appendChild(child);
        } else {
            dom.appendChild(document.createTextNode(child));
        }
    }
    return dom;
}

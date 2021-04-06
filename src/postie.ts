import type { PostieSettings, RequestMethod, Prompt, AcceptHeader, Swap } from "../postie";

class Postie{
    private io: IntersectionObserver;

    constructor(){
        this.io = new IntersectionObserver(this.observe.bind(this));
        this.main();
    }

    private observe:IntersectionObserverCallback = (elements:Array<IntersectionObserverEntry>) => {
        elements.forEach(e => {
            if (e.isIntersecting){
                this.processElement(e.target as HTMLElement);
                this.io.unobserve(e.target);
            }
        });
    }

    private beforeProcessElement(target:HTMLElement):void{
        let canProcess = true;
        if (target.getAttribute("once") !== null && target.getAttribute("postie-uid") !== null){
            canProcess = false;
        }
        if (canProcess){
            this.processElement(target);
        }
    }

    private handleClick:EventListener = (e:Event) => {
        const target = e.target as HTMLElement;
        if (target.getAttribute("postie") !== null){
            if (target.getAttribute("trigger")?.toLowerCase() === "click" || target.getAttribute("trigger") === null){
                this.beforeProcessElement(target);
            }
        }
    }

    private handleKeypress:EventListener = (e:Event) => {
        if (e instanceof KeyboardEvent){
            const target = e.target as HTMLElement;
            const trigger = target.getAttribute("trigger")?.toLowerCase() ?? null;
            if (target.getAttribute("postie") !== null){
                const key = e.key.toLowerCase();
                if (trigger === "keypress" || trigger === "keyup" || trigger === "keydown" || trigger === "key"){
                    if (target.getAttribute("key")?.toLowerCase() === key){
                        this.beforeProcessElement(target);
                    }
                } else if (trigger === "click" || trigger === null && key === "enter" || key === "") {
                    this.beforeProcessElement(target);
                }
            }
        }
    }

    private processElement(el:HTMLElement):void{
        const settings:PostieSettings = {
            method: <RequestMethod>el.getAttribute("request")?.toUpperCase() ?? "POST",
            accept: <AcceptHeader>el.getAttribute("accept")?.toLowerCase() ?? "application/json",
            data: el.dataset,
            endpoint: el.getAttribute("endpoint"),
            prompt: <Prompt>el.getAttribute("prompt")?.toLowerCase() ?? null,
            promptLabel: el.getAttribute("prompt-label"),
            promptValue: el.getAttribute("prompt-value") ?? "",
            promptName: el.getAttribute("prompt-name") ?? "prompt",
            success: el.getAttribute("success") || el.getAttribute("onsuccess") || null,
            error: el.getAttribute("error") || el.getAttribute("onerror") || null,
            preventDisable: (el.getAttribute("no-disable") !== null) || (el.getAttribute("prevent-disable") !== null) || false,
            once: (el.getAttribute("once") !== null),
            target: el.getAttribute("target"),
            swap: <Swap>el.getAttribute("swap") || "innerHTML",
            el: el,
            reset: (el.getAttribute("reset") !== null) ? parseInt(el.getAttribute("reset")) : 10,
        };
        if (settings.endpoint === null || settings.prompt !== null && settings.promptLabel === null){
            console.error("Invalid Postie settings.", settings);
            return;
        }
        if (el.getAttribute("postie-uid") === null){
            el.setAttribute("postie-uid", this.uuid());
        }
        switch (settings.prompt){
            case "confirm":
                if (!confirm(settings.promptLabel)){
                    return;
                }
                break;
            case "input":
                const value = prompt(settings.promptLabel, settings.promptValue);
                if (value === null){
                    return;
                }
                settings.data[settings.promptName] = value;
                break;
            default:
                break;
        }
        this.processRequest(settings);
    }

    private async processRequest(settings:PostieSettings):Promise<void>{
        let customEvent;
        try{
            settings.el.setAttribute("postie", "processing");
            if (!settings.preventDisable){
                settings.el.setAttribute("disabled", "true");
            }
            const request = await fetch(settings.endpoint, {
                method: settings.method,
                credentials: "include",
                headers: new Headers({
                    Accept: settings.accept,
                    "Content-Type": "application/json",
                }),
                body: JSON.stringify(settings.data),
            });
            let response = null;
            switch (settings.accept){
                case "application/json":
                    response = await request.json();
                    break;
                case "text/html":
                    response = await request.text();
                    break;
                default:
                    throw `Invalid accept type: ${settings.accept}`;
            }
            let script = document.head.querySelector("script#postie");
            if (script){
                script.remove();
            }
            script = document.createElement("script");
            script.id = "postie";
            if (request.ok){
                if (settings.success !== null){
                    if (settings.accept === "application/json"){
                        script.innerHTML += `const response = JSON.parse(${JSON.stringify(response)});`;
                    }
                    script.innerHTML += settings.success;
                }
                if (settings.accept === "text/html"){
                    let target = settings.el;
                    if (settings.target !== null){
                        target = document.body.querySelector(settings.target);
                        if (!target){
                            throw `Failed to find element matching selector: ${settings.target}`;
                        }
                    }
                    switch(settings.swap){
                        case "inner":
                            target.innerHTML = response;
                            break;
                        case "innerHTML":
                            target.innerHTML = response;
                            break;
                        case "outer":
                            target.outerHTML = response;
                            break;
                        case "outerHTML":
                            target.outerHTML = response;
                            break;
                        default:
                            throw `Invalid swap type: ${settings.swap}`;
                    }
                }
                settings.el.setAttribute("postie", "success");
            } else {
                console.error(`${request.status}: ${request.statusText}`);
                if (settings.error !== null){
                    if (settings.accept === "application/json"){
                        script.innerHTML += `const response = JSON.parse(${JSON.stringify(response)});`;
                    }
                    script.innerHTML += settings.error;
                }
                settings.el.setAttribute("postie", "error");
            }
            if (script.innerHTML.length){
                document.head.appendChild(script);
            }
            customEvent = new CustomEvent(`postie:${request.ok ? "success" : "error"}`, {
                detail: settings.accept === "application/json" ? response : null,
            });
        } catch (e) {
            console.error(e);
            settings.el.setAttribute("postie", "error");
            customEvent = new CustomEvent(`postie:error`, {
                detail: null,
            });
        }
        document.dispatchEvent(customEvent);
        settings.el.removeAttribute("disabled");
        setTimeout(() => {
            settings.el.setAttribute("postie", "idling");
        }, settings.reset * 1000);
    }

    private observeElements():void{
        document.body.querySelectorAll(`[postie][trigger="observe"]:not([postie-uid])`).forEach(el => {
            el.setAttribute("postie-uid", this.uuid());
            this.io.observe(el);
        });
    }

    private main(){
        document.addEventListener("click", this.handleClick, { passive: true, capture: true });
        document.addEventListener("keypress", this.handleKeypress, { passive: true, capture: true });
        document.addEventListener("postie:reload", () => {
            this.observeElements();
        });
        this.observeElements();
    }

    private uuid() {
        // @ts-ignore
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
      
}

const postie = new Postie();

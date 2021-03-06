import type { PostieSettings, RequestMethod, Prompt, AcceptHeader, Swap, Headers, Credentials } from "../postie";

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

    private preventDefault(target:HTMLElement, e:Event):void{
        if (target.getAttribute("allow-default") === null){
            e.preventDefault();
        }
    }

    private handleClick:EventListener = (e:Event) => {
        const target = e.target as HTMLElement;
        if (target.getAttribute("postie") !== null && target.getAttribute("disabled") === null){
            if (target.getAttribute("trigger")?.toLowerCase() === "click" || target.getAttribute("trigger") === null){
                this.preventDefault(target, e);
                this.beforeProcessElement(target);
            }
        }
    }

    private handleKeypress:EventListener = (e:Event) => {
        if (e instanceof KeyboardEvent){
            const target = e.target as HTMLElement;
            const trigger = target.getAttribute("trigger")?.toLowerCase() ?? null;
            if (target.getAttribute("postie") !== null && target.getAttribute("disabled") === null){
                const key = e.key.toLowerCase();
                if (trigger === "keypress" || trigger === "keyup" || trigger === "keydown" || trigger === "key"){
                    if (target.getAttribute("key")?.toLowerCase() === key){
                        this.preventDefault(target, e);
                        this.beforeProcessElement(target);
                    }
                } else if (trigger === "click" || trigger === null && key === "enter" || key === "") {
                    this.preventDefault(target, e);
                    this.beforeProcessElement(target);
                }
            }
        }
    }

    private applyUid(el:HTMLElement):void{
        if (el.getAttribute("postie-uid") === null){
            el.setAttribute("postie-uid", this.uuid());
        }
    }

    private handlePrompt(settings:PostieSettings){
        switch (settings.prompt){
            case "confirm":
                if (!confirm(settings.promptLabel)){
                    throw "User canceled.";
                }
                return;
            case "input":
                const value = prompt(settings.promptLabel, settings.promptValue);
                if (value === null){
                    throw "User canceled.";
                }
                settings.data[settings.promptName] = value;
                return;
            default:
                return;
        }
    }

    private validateSettings(settings:PostieSettings):void{
        if (settings.endpoint === null || settings.prompt !== null && settings.promptLabel === null){
            throw "Invalid Postie settings.";
        }
    }

    private parseHeaders(raw:string):Headers{
        const output = {};
        const headers = raw.replace(/\;$/, "").trim().split(";");
        for (let i = 0; i < headers.length; i++){
            const values = headers[i].split(":");
            if (values.length === 2){
                output[values[0].trim()] = values[1].trim();
            }
        }
        return output;
    }

    private processElement(el:HTMLElement):void{
        try {
            const settings:PostieSettings = {
                method: <RequestMethod>el.getAttribute("request")?.toUpperCase() || <RequestMethod>el.getAttribute("method")?.toUpperCase() || "POST",
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
                headers: el.getAttribute("headers") !== null ? this.parseHeaders(el.getAttribute("headers")) : {},
                credentials: <Credentials>el.getAttribute("credentials") ?? "same-origin",
            };
            this.validateSettings(settings);
            this.handlePrompt(settings);
            this.applyUid(el);
            this.fetch(settings);
        } catch (e) {
            console.error(e);
        }
    }

    private createRequest(settings:PostieSettings):Promise<Response>{
        const headers = Object.assign({
            Accept: settings.accept,
            "Content-Type": "application/json",
        }, settings.headers);
        return fetch(settings.endpoint, {
            method: settings.method,
            credentials: settings.credentials,
            headers: new Headers(headers),
            body: Object.keys(settings.data).length ? JSON.stringify(settings.data) : null,
        });
    }

    private async processResponse(settings:PostieSettings, request:Response):Promise<any>{
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
        return response;
    }

    private prepareScript():HTMLScriptElement{
        let script = document.head.querySelector("script#postie");
        if (script){
            script.remove();
        }
        script = document.createElement("script");
        script.id = "postie";
        return script as HTMLScriptElement;
    }

    private handleSuccessResponse(settings:PostieSettings, response:any, script:HTMLScriptElement):void{
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
            this.observeElements();
        }
        settings.el.setAttribute("postie", "success");
    }

    private handleErrorResponse(settings:PostieSettings, response:any, script:HTMLScriptElement):void{
        if (settings.error !== null){
            if (settings.accept === "application/json"){
                script.innerHTML += `const response = JSON.parse(${JSON.stringify(response)});`;
            }
            script.innerHTML += settings.error;
        }
        settings.el.setAttribute("postie", "error");
    }

    private dispatchEvent(type:"success"|"error", data = null):void{
        const customEvent = new CustomEvent(`postie:${type}`, {
            detail: data,
        });
        document.dispatchEvent(customEvent);
    }

    private reset(settings:PostieSettings):void{
        if (!settings.once){
            settings.el.removeAttribute("disabled");
        }
        setTimeout(() => {
            settings.el.setAttribute("postie", "idling");
        }, settings.reset * 1000);
    }

    private async fetch(settings:PostieSettings):Promise<void>{
        try{
            settings.el.setAttribute("postie", "processing");
            if (!settings.preventDisable){
                settings.el.setAttribute("disabled", "true");
            }
            const request = await this.createRequest(settings);
            const response = await this.processResponse(settings, request);
            const script = this.prepareScript();
            if (request.ok){
                this.handleSuccessResponse(settings, response, script);
            } else {
                this.handleErrorResponse(settings, response, script);
            }
            if (script.innerHTML.length){
                document.head.appendChild(script);
            }
            this.dispatchEvent(request.ok ? "success" : "error", settings.accept === "application/json" ? response : null);
        } catch (e) {
            console.error(e);
            settings.el.setAttribute("postie", "error");
            this.dispatchEvent("error");
        }
        this.reset(settings);
    }

    private observeElements():void{
        document.body.querySelectorAll(`[postie][trigger="observe"]:not([postie-uid])`).forEach(el => {
            this.applyUid(el as HTMLElement);
            this.io.observe(el);
        });
    }

    private main(){
        document.addEventListener("click", this.handleClick, { capture: true });
        document.addEventListener("keypress", this.handleKeypress, { capture: true });
        document.addEventListener("postie:update", () => {
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

import type { PostieSettings, Request, Prompt } from "../postie";

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
        if (target.getAttribute("postie") !== null && target.getAttribute("trigger")?.toLowerCase() === "click" || target.getAttribute("trigger") === null){
            this.beforeProcessElement(target);
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
            request: <Request>el.getAttribute("request")?.toUpperCase() ?? "POST",
            data: el.dataset,
            endpoint: el.getAttribute("endpoint"),
            prompt: <Prompt>el.getAttribute("prompt")?.toLowerCase() ?? null,
            promptLabel: el.getAttribute("prompt-label"),
            promptValue: el.getAttribute("prompt-value"),
            success: el.getAttribute("success") || el.getAttribute("onsuccess") || null,
            error: el.getAttribute("error") || el.getAttribute("onerror") || null,
            preventDisable: (el.getAttribute("no-disable") !== null) || (el.getAttribute("prevent-disable") !== null) || false,
            once: (el.getAttribute("once") !== null) || false,
        };
        if (settings.endpoint === null || settings.prompt !== null && settings.promptLabel === null){
            console.error("Invalid Postie settings.", settings);
            return;
        }
        if (el.getAttribute("postie-uid") === null){
            el.setAttribute("postie-uid", this.uuid());
        }
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

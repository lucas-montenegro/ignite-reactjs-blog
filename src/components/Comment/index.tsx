import { useEffect } from "react";

export function Comment() {
    useEffect(() => {
        const script = document.createElement("script");
        const anchor = document.getElementById("uterances-comments");
        script.setAttribute("src", "https://utteranc.es/client.js");
        script.setAttribute("crossorigin","anonymous");
        script.setAttribute("async", true);
        script.setAttribute("repo", "lucas-montenegro/ignite-reactjs-blog");
        script.setAttribute("issue-term", "pathname");
        script.setAttribute( "theme", "github-dark");
        anchor.appendChild(script);
    }, []);


    return (
        <>
            <div id="uterances-comments" />
        </>
    )
}
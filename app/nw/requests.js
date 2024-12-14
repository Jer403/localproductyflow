import { getLangNodeName, getLangProjectName, getProjectsBox, getSurface, getVariableConfig } from "../network.js";
import { createNode, createOneProjectButton } from "./creator.js";
import { generateLink } from "./events.js";
import { buildErrorLog, cleanNodeSurface, cleanSurface, getCurrentNetworkProject, loading, noProjectsFound, openFirstProject, removeInfoLabel, setActualProject, setCurrentNetworkProject, setIsSaveToTrue, showErrors } from "./nwUtils.js";

export async function createNewProject() {
    const { containers: { saveBtn } } = getVariableConfig();

    let id = Math.floor(Math.random() * 100000);
    let emptyData = {};
    emptyData.listProjectName = "Untitled Project";
    emptyData = JSON.stringify(emptyData)
    localStorage.setItem(`localNwProject-${id}`, emptyData)


    removeInfoLabel(getProjectsBox(), "noProject")

    let btn;
    btn = createOneProjectButton(getLangProjectName(), id)

    getProjectsBox().appendChild(btn);

    if (saveBtn.classList.contains("unsave")) {
        update(getCurrentNetworkProject())
    }

    loadProjectOnAction(btn.dataset.id);
    setActualProject(btn);
    setIsSaveToTrue();


}


export async function deleteProject(e) {

    let idToDelete = e.currentTarget.parentNode.parentNode.dataset.id;

    let boxToDelete = e.currentTarget.parentNode.parentNode;

    let pregunta = confirm("¿Esta seguro/a de que quiere eliminar ese projecto?")
    if (pregunta) {

        localStorage.removeItem(`localNwProject-${idToDelete}`)

        if (getCurrentNetworkProject() == idToDelete) {
            setCurrentNetworkProject(null);
            cleanSurface(getSurface());
        }

        getProjectsBox().removeChild(boxToDelete);


        if (getProjectsBox().children.length != 0 && getCurrentNetworkProject() == "null") {
            openFirstProject();
        } else if (getProjectsBox().children.length == 0) {
            getProjectsBox().appendChild(noProjectsFound());
        }



    }
}





export async function update(id) {                     //Updates the project in the DB

    let nodeDoc = JSON.parse("[]");
    let linkDoc = JSON.parse("[]");
    let projectName = "";

    const nodos = document.querySelectorAll(".nodo");
    const lines = document.querySelectorAll(".line");
    const projects = document.querySelectorAll(".project-box");

    projects.forEach((p) => {
        if (p.dataset.id == id) {
            projectName = p.textContent;
        }
    })

    nodos.forEach((n) => {
        let type = "sq";
        let check = "f";
        if (n.classList.contains("check")) check = "t";
        if (n.classList.contains("circle")) type = "cir";
        nodeDoc[nodeDoc.length] = JSON.parse(`
		   {"i": "${n.dataset.id}", 
			"x":"${n.getAttribute("x")}", 
			"y":"${n.getAttribute("y")}", 
			"c":"${check}",
			"tx":"${n.firstChild.value}",
			"tp":"${type}"}`);
    })

    lines.forEach((l) => {
        linkDoc[linkDoc.length] = JSON.parse(`
			{"i1": "${l.getAttribute("id1")}", 
			 "i2": "${l.getAttribute("id2")}", 
			 "arw":"${(l.classList.contains("arrow"))}"}`);
    })



    let datos = {};
    datos.nodeProject = nodeDoc;
    datos.nodeProjectName = projectName;
    datos.linkProject = linkDoc;
    datos = JSON.stringify(datos);


    localStorage.setItem(`localNwProject-${id}`, datos)

    buildErrorLog("green", "Datos guardados exitosamente");
}


export async function loadProjectOnAction(id) {  //When you click in a project button or onload
    const { containers: { surface, svg } } = getVariableConfig();

    let item = localStorage.getItem(`localNwProject-${id}`)


    if (item == "null") {
        item = {}
        item.nodeProject = ""
        item.linkProject = "";
    }

    loadProject(JSON.parse(item), surface, svg);
    document.querySelectorAll(".project-box").forEach((p) => {
        if (p.dataset.id == id) {
            setActualProject(p);
        }
    })

}
export function loadProject(Project, surface, svg) {
    cleanNodeSurface(surface, svg);
    let nodeDoc = Project.nodeProject;
    let linkDoc = Project.linkProject;
    if (nodeDoc) {
        nodeDoc.forEach((d) => {
            if (d.tp == "circle") {
                d.y = 70;
            }
            const node = createNode(d.x, d.y, d.tp, d.tx);
            node.dataset.id = d.i;
            node.firstChild.textContent = d.tx;
            if (d.c == "t") node.classList.add("check");
            surface.appendChild(node);
        })
        if (linkDoc) {
            const nodos = document.querySelectorAll(".nodo");
            linkDoc.forEach((l) => {
                generateLink(l.i1, l.i2, l.arw, nodos, svg);
            })
        }
    }
}


export async function loadProjectsFromUsers() {   //Gets all the projects ids

    loading(getProjectsBox())

    const projects = [];
    const prefix = 'localNwProject-';

    // Iterar sobre todas las claves en localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Verificar si la clave comienza con el prefijo deseado
        if (key.startsWith(prefix)) {
            // Obtener el valor asociado a la clave y agregarlo al array
            const value = localStorage.getItem(key);
            projects.push({ key, value });
        }
    }


    return projects;


}


import { getListName, getProjectsBox, getSurfaceList } from "../taskmanager.js";
import { createListElement, createOneProjectButton, noProjectsFound, removeInfoLabel } from "./creator.js";
import { cleanSurface, buildErrorLog, getCurrentListProject, listNameLang, loading, openFirstProject, openSelectedProjectOrFirstProject, setActualProject, setCurrentListProject, showErrors } from "./tmUtils.js";




export async function createNewProject() {

    let id = Math.floor(Math.random() * 100000);
    let emptyData = {};
    emptyData.listProjectName = "Untitled Project";
    emptyData = JSON.stringify(emptyData)
    localStorage.setItem(`localTmProject-${id}`, emptyData)

    removeInfoLabel(getProjectsBox(), "nop");

    let btn = createOneProjectButton(listNameLang(), id)

    getProjectsBox().appendChild(btn);

    setActualProject(btn)
    loadListOnAction(btn.dataset.id);

}




export async function deleteProject(e) {

    let idToDelete = e.currentTarget.parentNode.parentNode.dataset.id;

    let boxToDelete = e.currentTarget.parentNode.parentNode;

    let pregunta = confirm("¿Esta seguro/a de que quiere eliminar ese projecto?")
    if (pregunta) {

        localStorage.removeItem(`localTmProject-${idToDelete}`)


        if (getCurrentListProject() == idToDelete) {
            setCurrentListProject(null);
            cleanSurface(getSurfaceList());
        }

        getProjectsBox().removeChild(boxToDelete);

        if (getProjectsBox().children.length != 0 && getCurrentListProject() == "null") {
            openFirstProject();
        } else if (getProjectsBox().children.length == 0) {
            noProjectsFound();
        }
    }




}





export async function update(id) {                     //Updates the project in the DB

    let listDoc = JSON.parse("[]");
    let projectName = "";

    const tasksText = document.querySelectorAll(".list-element-text-main");

    projectName = getListName().textContent;


    tasksText.forEach((t) => {
        let check = "f", fav = "f";
        if (t.previousElementSibling.classList.contains("fa-check-square-o")) check = "t";
        if (t.parentNode.parentNode.classList.contains("favorite")) fav = "t";
        listDoc[listDoc.length] = JSON.parse(`
		   {"check": "${check}", 
			"txt":"${t.textContent}",
            "fav":"${fav}"}`);
    })

    let dataToSave = {};
    dataToSave.listProjectName = projectName;
    dataToSave.listProject = listDoc;
    dataToSave = JSON.stringify(dataToSave)

    localStorage.setItem(`localTmProject-${id}`, dataToSave)

    buildErrorLog("green", "Datos guardados exitosamente");
}










export async function updateCalendar(e, date) {                     //Updates the project in the DB

    let listDoc = JSON.parse("[]");

    const tsks = e.children;


    Array.from(tsks).forEach(t => {
        let check = "f", fav = "f";
        if (t.firstChild.firstChild.classList.contains("fa-check-square-o")) check = "t";
        if (t.classList.contains("favorite")) fav = "t";
        listDoc[listDoc.length] = JSON.parse(`
		   {"check": "${check}", 
			"txt":"${t.firstChild.firstChild.nextElementSibling.textContent}",
            "fav":"${fav}"}`);
    })

    let datos = {};
    datos.listProject = listDoc;
    datos = JSON.stringify(datos);

    localStorage.setItem(`calendarList_${date}`, datos)

    buildErrorLog("green", "Datos guardados exitosamente");
}




export async function loadCalendarList(date, surface) {  //When you click in a project button or onload

    let item = localStorage.getItem(`calendarList_${date}`)

    if (item == "null" || !item) {
        surface.appendChild(createListElement("", "f", "f", false, surface))
        return;
    }

    loadProject(surface, JSON.parse(item).listProject, false);


}

















export async function loadListOnAction(id) {  //When you click in a project button or onload

    let item = localStorage.getItem(`localTmProject-${id}`)

    if (item == "null" || !item) {
        item = {};
        item.listProject = "";
    }

    item = JSON.parse(item);

    loadProject(getSurfaceList(), item.listProject, true, item.listProjectName);
    document.querySelectorAll(".list-box").forEach((p) => {
        if (p.dataset.id == id) {
            setActualProject(p);
        }
    })

}







export function loadProject(surface, Project, main, listProjectName) {       		   //This is needed in the above one  
    cleanSurface(surface);
    if (Project) {
        Project.forEach((l) => {
            const element = createListElement(l.txt, l.check, l.fav, main, surface);
            surface.appendChild(element);
        })
    }
    if (surface == getSurfaceList()) {
        getListName().textContent = listProjectName;
    }
}











export function createProjectButtons(Lists) {       //This needs the next one
    getProjectsBox().innerHTML = "";
    if (!Lists) {
        return null;
    }

    if (Lists.length != 0) {
        Lists.map(({ key, value }) => {
            let id = key.split("-")[1];
            let name = JSON.parse(value).listProjectName;
            getProjectsBox().appendChild(createOneProjectButton(name, id));
        })

        openSelectedProjectOrFirstProject();
    } else {
        getProjectsBox().appendChild(noProjectsFound())
    }

}












export async function loadProjectsFromUsers() {   //Gets all the projects ids

    loading(getProjectsBox())

    const lists = [];
    const prefix = 'localTmProject-';

    // Iterar sobre todas las claves en localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        // Verificar si la clave comienza con el prefijo deseado
        if (key.startsWith(prefix)) {
            // Obtener el valor asociado a la clave y agregarlo al array
            const value = localStorage.getItem(key);
            lists.push({ key, value });
        }
    }


    return lists;
}

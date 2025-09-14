import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {trigger, state, style, animate, transition} from '@angular/animations';

interface FileItem
{
    id: number;
    name: string;
    type: 'folder' | 'file';
    children?: FileItem[];
}

interface PathItem
{
    folder: FileItem;
    name: string;
}

@Component({
               selector: 'app-comp-folder',
               standalone: true,
               imports: [
                   CommonModule, FormsModule
               ],
               templateUrl: './comp-folder.html',
               styleUrls: ['./comp-folder.scss'],
               animations: [
                   trigger('modalAnimation', [
                       transition(':enter', [
                           style({opacity: 0, transform: 'scale(0.8) translateY(20px)'}),
                           animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                                   style({opacity: 1, transform: 'scale(1) translateY(0)'}))
                       ]),
                       transition(':leave', [
                           animate('250ms ease-out',
                                   style({opacity: 0, transform: 'scale(0.9) translateY(-15px)'}))
                       ])
                   ])
               ]
           })
export class CompFolder
{

    isModalOpen = false;

    openModal()
    {
        this.isModalOpen = true;
    }

    closeModal()
    {
        this.isModalOpen = false;
    }


    viewMode: 'grid' | 'list' = 'grid';
    loading = false;

    // 根目录数据结构
    rootFolder: FileItem = {
        id: 0,
        name: 'Home',
        type: 'folder',
        children: [
            {
                id: 1,
                name: 'Documents',
                type: 'folder',
                children: [
                    {id: 2, name: 'Report.pdf', type: 'file'},
                    {id: 3, name: 'Resume.docx', type: 'file'}
                ]
            },
            {
                id: 4,
                name: 'Photos',
                type: 'folder',
                children: [
                    {id: 5, name: 'Vacation.jpg', type: 'file'},
                    {id: 6, name: 'Family.png', type: 'file'}
                ]
            },
            {id: 7, name: 'Project.zip', type: 'file'}
        ]
    };

    pathStack: PathItem[] = [{folder: this.rootFolder, name: 'Home'}];
    selectedItems: FileItem[] = [];

    showCopyMoveDialog = false;
    copyMoveAction: 'copy' | 'move' = 'copy';
    targetFolder: FileItem | null = null;

    searchQuery = '';

    get currentPath(): string[]
    {
        return this.pathStack.map(p => p.name);
    }

    get currentFolder(): FileItem
    {
        return this.pathStack[this.pathStack.length - 1].folder;
    }

    get displayedItems(): FileItem[]
    {
        if (this.searchQuery.trim()) {
            return this.filteredItems;
        }
        return this.currentFolder.children || [];
    }

    get filteredItems(): FileItem[]
    {
        if (!this.searchQuery.trim()) return this.displayedItems;

        const query = this.searchQuery.toLowerCase();
        const result: FileItem[] = [];

        const searchInFolder = (folder: FileItem) =>
        {
            if (folder.children) {
                for (const item of folder.children) {
                    if (item.name.toLowerCase().includes(query)) {
                        result.push(item);
                    }
                    if (item.type === 'folder') {
                        searchInFolder(item);
                    }
                }
            }
        };

        searchInFolder(this.rootFolder);

        return result;
    }

    navigateTo(folder: FileItem)
    {
        if (folder.type === 'folder') {
            this.pathStack.push({folder, name: folder.name});
        }
    }

    goBack()
    {
        if (this.pathStack.length > 1) {
            this.pathStack.pop();
        }
    }

    goToBreadcrumb(index: number)
    {
        this.pathStack = this.pathStack.slice(0, index + 1);
    }

    selectItem(item: FileItem)
    {
        const index = this.selectedItems.findIndex(i => i.id === item.id);
        if (index > -1) {
            this.selectedItems.splice(index, 1);
        } else {
            this.selectedItems.push(item);
        }
    }

    isItemSelected(item: FileItem): boolean
    {
        return this.selectedItems.some(i => i.id === item.id);
    }

    createFolder()
    {
        const folderName = prompt('请输入文件夹名称');
        if (folderName && this.currentFolder.children !== undefined) {
            this.currentFolder.children.push({
                                                 id: Date.now(),
                                                 name: folderName,
                                                 type: 'folder',
                                                 children: []
                                             });
        }
    }

    deleteSelected()
    {
        this.loading = true;
        setTimeout(() =>
                   {
                       this.currentFolder.children = this.currentFolder.children?.filter(
                           f => !this.selectedItems.some(sel => sel.id === f.id)
                       );
                       this.selectedItems = [];
                       this.loading = false;
                   }, 800);
    }

    renameItem()
    {
        if (this.selectedItems.length === 1) {
            const newName = prompt('请输入新名称', this.selectedItems[0].name);
            if (newName) {
                this.selectedItems[0].name = newName;
                this.selectedItems = [];
            }
        }
    }

    uploadFile(event: Event)
    {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            for (const file of Array.from(input.files)) {
                this.currentFolder.children!.push({
                                                      id: Date.now() + Math.random(),
                                                      name: file.name,
                                                      type: 'file'
                                                  });
            }
        }
    }

    openCopyMoveDialog(action: 'copy' | 'move')
    {
        if (this.selectedItems.length === 0) return;
        this.copyMoveAction = action;
        this.showCopyMoveDialog = true;
        this.targetFolder = null;
    }

    confirmCopyMove()
    {
        if (!this.targetFolder) return;

        if (this.copyMoveAction === 'copy') {
            this.copyItems(this.targetFolder);
        } else {
            this.moveItems(this.currentFolder, this.targetFolder);
        }

        this.showCopyMoveDialog = false;
    }

    cancelCopyMove()
    {
        this.showCopyMoveDialog = false;
    }

    copyItems(target: FileItem)
    {
        const itemsToCopy = this.selectedItems.filter(item => item.type === 'file');
        for (const item of itemsToCopy) {
            target.children!.push({
                                      ...item,
                                      id: Date.now() + Math.random(),
                                      name: `${item.name} (副本)`
                                  });
        }
    }

    moveItems(sourceFolder: FileItem,
              target: FileItem)
    {
        sourceFolder.children = sourceFolder.children?.filter(
            f => !this.selectedItems.some(sel => sel.id === f.id)
        );
        for (const item of this.selectedItems) {
            target.children!.push({...item});
        }
        this.selectedItems = [];
    }

    getAllFolders(): FileItem[]
    {
        const folders: FileItem[] = [];

        const traverse = (folder: FileItem) =>
        {
            if (folder.type === 'folder' && folder.children) {
                folders.push(folder);
                for (const child of folder.children) {
                    traverse(child);
                }
            }
        };

        traverse(this.rootFolder);
        return folders;
    }

    toggleView(mode: 'grid' | 'list')
    {
        this.viewMode = mode;
    }

}

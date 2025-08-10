import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'replace'
})
export class ReplacePipe implements PipeTransform {
    transform(value: string, search: string, replace: string): string {
        if (!value) return '';
        return value.replace(new RegExp(search, 'g'), replace);
    }
}

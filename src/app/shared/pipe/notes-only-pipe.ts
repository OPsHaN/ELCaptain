import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'notesOnly',
  pure: true,
})
export class NotesOnlyPipe implements PipeTransform {
  transform(commands: any[], isNotes: boolean = true): any[] {
    if (!Array.isArray(commands)) return [];

    if (isNotes) {
      // ✅ رجّع الملاحظات فقط
      return commands.filter(cmd => cmd.IsNotes === true);
    } else {
      // ✅ رجّع غير الملاحظات (false أو null)
      return commands.filter(cmd => cmd.IsNotes === false || cmd.IsNotes == null);
    }
  }
}

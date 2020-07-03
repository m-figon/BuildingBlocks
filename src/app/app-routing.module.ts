import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AComponent } from './a/a.component';
import { BComponent } from './b/b.component';
import { CComponent } from './c/c.component';
const routes: Routes = [
  { path: 'A',
    component: AComponent, // this is the component with the <router-outlet> in the template
  },
  { path: 'B',
    component: BComponent, // this is the component with the <router-outlet> in the template
  },
  { path: 'C',
    component: CComponent, // this is the component with the <router-outlet> in the template
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

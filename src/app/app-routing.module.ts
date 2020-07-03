import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AComponent } from './a/a.component';
import { BComponent } from './b/b.component';
import { CComponent } from './c/c.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '',
    component: HomeComponent, // this is the component with the <router-outlet> in the template
  },
  { path: 'status',
    component: AComponent, // this is the component with the <router-outlet> in the template
  },
  { path: 'core',
    component: BComponent, // this is the component with the <router-outlet> in the template
  },
  { path: 'equipment',
    component: CComponent, // this is the component with the <router-outlet> in the template
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

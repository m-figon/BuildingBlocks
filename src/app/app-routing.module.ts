import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AComponent } from './a/a.component';
import { BComponent } from './b/b.component';
import { CComponent } from './c/c.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '',
    component: HomeComponent,
  },
  { path: 'status',
    component: AComponent,
  },
  { path: 'core',
    component: BComponent,
  },
  { path: 'equipment',
    component: CComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

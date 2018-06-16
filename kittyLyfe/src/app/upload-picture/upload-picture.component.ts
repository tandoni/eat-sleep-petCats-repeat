import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AngularFireList, AngularFireDatabase } from 'angularfire2/database';
import { finalize } from 'rxjs/operators';

import { Photo } from '../models/post.model';
import { AuthService } from '../../services/auth.service';
import { PostService } from '../../services/post.service';
import { MatSnackBar, MatDialogRef } from '@angular/material';
import * as firebase from 'firebase';
import { AngularFireStorage } from 'angularfire2/storage';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-upload-picture',
  templateUrl: './upload-picture.component.html',
  styleUrls: ['./upload-picture.component.scss']
})
export class UploadPictureComponent implements OnInit {

  url: string;
  caption: string;

  photoListStream: AngularFireList<Photo[]>;

  constructor(public db: AngularFireDatabase, public authService: AuthService, public postService: PostService,
    public snackBar: MatSnackBar, private dialogRef: MatDialogRef<UploadPictureComponent>,
    private storage: AngularFireStorage) {
      this.photoListStream = this.db.list('/photos');
     }

  ngOnInit() {
  }

  onSubmit() {
    try {
      const photo = new Photo({
        url: this.url,
        caption: this.caption,
        uid: this.authService._currentUsersUid,
      });

      // this.postService.addPhoto(photo);
      // const sbRef = this.snackBar.open('Photo added', '', {
      //   duration: 5000,
      // });

      // this.photoListStream.update(nextKey, photo);
      this.url = '';
      this.caption = '';
      this.dialogRef.close(photo);
    } catch (error) {
      console.error('submit failed');
    }
  }

  randomString() {
    let length = 32
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

  photoSelected(event: any) {
    const file: File = event.target.files[0];
    const metaData = { 'contentType': file.type };
    // const nextKey = this.photoListStream.push({}).key;
    const storageRef = this.storage.ref(`/photos/${this.randomString()}`);
    const uploadTask = storageRef.put(file, metaData);
    console.log(`Uploading: ${file.name}`);
    document.getElementById('spinner').style.display = 'flex';
    document.getElementById('upload').style.display = 'none';

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        console.log(`Upload is complete!`);
        console.log(uploadTask);
        document.getElementById('spinner').style.display = 'none';
        document.getElementById('upload').style.display = 'block';
        document.getElementsByName('url')[0].focus();
        storageRef.getDownloadURL().toPromise().then(ref => {
          this.url = ref;
        });
      })
   )
  .subscribe()

    // uploadTask.then((uploadSnapshot) => {
    //   console.log(`Upload is complete!`);
    //   console.log(uploadTask);
    //   document.getElementById('spinner').style.display = 'none';
    //   document.getElementById('upload').style.display = 'block';
    //   document.getElementsByName('url')[0].focus();
    //   // firebase.database().ref(`/photos/list/${nextKey}`).set(nextKey);
    //   this.url = uploadSnapshot.downloadURL;
    //   console.log(this.url);
    // });
  }

}
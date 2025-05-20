import { google } from 'googleapis';
import axios from 'axios';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

class GoogleDriveService {
  constructor() {
    this.auth = null;
    this.drive = null;
  }

  async initialize(clientId, clientSecret, redirectUri) {
    this.auth = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    this.drive = google.drive({ version: 'v3', auth: this.auth });
  }

  getAuthUrl() {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
  }

  async setCredentials(code) {
    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);
    return tokens;
  }

  async uploadFile(file) {
    try {
      const fileMetadata = {
        name: file.name,
        mimeType: file.type,
      };

      const media = {
        mimeType: file.type,
        body: file,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webContentLink',
      });

      // Set file to be accessible via link
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return {
        fileId: response.data.id,
        webContentLink: response.data.webContentLink,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async getStreamUrl(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        fields: 'webContentLink',
      });
      return response.data.webContentLink;
    } catch (error) {
      console.error('Error getting stream URL:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

export const driveService = new GoogleDriveService();
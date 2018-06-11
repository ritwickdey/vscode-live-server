import * as assert from 'assert';

import * as vscode from 'vscode';
import { Helper } from '../src/Helper';

suite('Helper Tests', () => {

    suite('Test for IsSupportedFile() method', () => {
        test('should return true for html file. e.g. file=index.html', () => {
            const file = 'index.html';
            const result = Helper.IsSupportedFile(file);
            assert.equal(result, true);
        });
        test('should return true for full path html file. e.g. file=/user/path/index.html', () => {
            const file = '/user/path/index.html';
            const result = Helper.IsSupportedFile(file);
            assert.equal(result, true);
        });
        test('should return true for svg file. e.g. file=index.svg', () => {
            const file = 'index.svg';
            const result = Helper.IsSupportedFile(file);
            assert.equal(result, true);
        });
        test('should return true for htm file. e.g. file=index.htm', () => {
            const file = 'index.htm';
            const result = Helper.IsSupportedFile(file);
            assert.equal(result, true);
        });
        test('should return false for XYZ file. e.g. file=index.xyz', () => {
            const file = 'index.xyz';
            const result = Helper.IsSupportedFile(file);
            assert.equal(result, false);
        });

        test('should return true for full path xyz file. e.g. file=/user/path/index.xyz', () => {
            const file = '/user/path/index.xyz';
            const result = Helper.IsSupportedFile(file);
            assert.equal(result, false);
        });
    });

    suite('Test for getSubPathIfSupported() method', () => {
        test('Should return correct Relative Path. format 1', () => {
            const targetPath = 'c:\\Users\\HTML\\cake\\index.html';
            const rootPath = 'c:\\Users\\HTML\\cake\\';
            const result = Helper.getSubPath(rootPath, targetPath);
            assert.equal(result, 'index.html');
        });

        test('Should return correct Relative Path. format 2', () => {
            const targetPath = 'c:\\Users\\HTML\\cake\\sub\\hello.html';
            const rootPath = 'c:\\Users\\HTML\\cake\\';
            const result = Helper.getSubPath(rootPath, targetPath);
            assert.equal(result, 'sub\\hello.html');
        });

        test('Should return null as targert file format is unsupported', () => {
            const targetPath = 'c:\\Users\\HTML\\cake\\sub\\hello.xyz';
            const rootPath = 'c:\\Users\\HTML\\cake\\';
            const result = Helper.getSubPath(rootPath, targetPath);
            assert.equal(result, null);
        });
    });

    suite('Test for generateParams() method', () => {
        test('should return correct parameters', () => {
            // const targetPath = 'c:\\Users\\HTML\\cake\\index.html';
            const rootPath = 'c:\\Users\\HTML\\cake\\';
            const port = 8080;
            const workspace = 'c:\\Users\\HTML\\';
            const ignorePathGlob = [];

            const result = Helper.generateParams(rootPath, workspace);

          // assert.equal(result.port, port); //next todo
           assert.equal(result.root, rootPath);
        });
    });


});
var React = require('react-native');
var NavigationBar = require('react-native-navbar');
var _ = require('lodash');
var api = require('../Utils/api');
var IconIon = require('react-native-vector-icons/Ionicons');
var PhotoSwiperView = require('./PhotoSwiperView');

var {
  Navigator,
  StyleSheet,
  View,
  Text,
  Dimensions,
  Image,
  ScrollView,
  ActivityIndicatorIOS,
  StatusBarIOS,
  TouchableHighlight
} = React;

var {width, height} = Dimensions.get('window');

var LATITUDE;
var LONGITUDE;

navigator.geolocation.getCurrentPosition(
  location => {
    LATITUDE = location.coords.latitude;
    LONGITUDE = location.coords.longitude;
  }
);

var IMAGES_PER_ROW = 3

class PhotosView extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      currentScreenWidth: width,
      currentScreenHeight: height,
      imageUrls: undefined,
      userId: this.props.route.userId,
      previousComponent: this.props.route.previousComponent,
    };
    if(this.state.userId){
      console.log('user fetch', this.state.userId);
      api.fetchUserPhotos(this.state.userId, (photos) => {
        var photosArr = JSON.parse(photos);
        var photosUrls = photosArr.map((photo) => {
          return photo.url;
        });
        this.setState({ imageUrls: photosUrls });
      })
    } else {
      api.fetchPhotos(LATITUDE, LONGITUDE, 50, (photos) => { // need to pass in the radius (in m) from the MapView; hardcoding as 50m for now
        var photosArr = JSON.parse(photos);
        var photosUrls = photosArr.map((photo) => {
          return photo.url;
        });
        this.setState({ imageUrls: photosUrls });
      })
    }
  }

  componentWillUnmount() {
    if(this.state.previousComponent==='settings') {StatusBarIOS.setHidden(false);}
    if(this.state.previousComponent==='map') {StatusBarIOS.setHidden(true);}
  }

  handleRotation(event) {
    var layout = event.nativeEvent.layout;
    this.setState({ currentScreenWidth: layout.width, currentScreenHeight: layout.height });
  }

  calculatedSize() {
    var size = this.state.currentScreenWidth / IMAGES_PER_ROW;
    return { width: size, height: size };
  }

  // function that returns a function that knows the correct uri to render
  showImageFullscreen(uri, index) {
    return () => {
      console.log(uri);
      console.log(this.state.imageUrls);
      this.props.navigator.push({
        component: PhotoSwiperView,
        index: index,
        photos: this.state.imageUrls,
        uri: uri,
        width: this.state.currentScreenWidth,
        sceneConfig: {
          ...Navigator.SceneConfigs.FloatFromBottom,
          gestures: {
            pop: {
              ...Navigator.SceneConfigs.FloatFromBottom.gestures.pop,
              edgeHitWidth: Dimensions.get('window').height,
            },
          },
        }
      });
    }
  }

  renderRow(images) {
    return images.map((uri, index) => {
      return (
        // Hardcoded key value for each element below to dismiss eror message
        <TouchableHighlight onPress={this.showImageFullscreen(uri, index)}>
          <Image style={[styles.image, this.calculatedSize()]} source={{uri: uri}} />
        </TouchableHighlight>
      )
    })
  }

  renderImagesInGroupsOf(count) {
    return _.chunk(IMAGE_URLS, IMAGES_PER_ROW).map((imagesForRow) => {
      return (
        <View style={styles.row}>
          {this.renderRow(imagesForRow)}
        </View>
      )
    })
  }

  _backButton() {
    this.props.navigator.pop();
  }

  render() {
    StatusBarIOS.setHidden(false);
    var pageTitle = (
       this.state.userId ? <Text style={styles.pageTitle}>Your Photos</Text> : <Text style={styles.pageTitle}>Photos Near You</Text>
    )
    var backButton = (
      <TouchableHighlight onPress={this._backButton.bind(this)} underlayColor={'white'}>
        <IconIon name='ios-arrow-thin-down' size={30} style={styles.backIcon} color="#FF5A5F"/>
      </TouchableHighlight>
    );
    return (
      <View style={{flex: 1, backgroundColor: '#ededed' }}>
        <NavigationBar 
          title={pageTitle} 
          tintColor={"white"} 
          statusBar={{hidden: false}}
          leftButton={backButton}/>
        {this.state.imageUrls ? null : <ActivityIndicatorIOS size={'large'} style={[styles.centering, {height: 550}]} />}
        {this.state.imageUrls && !this.state.imageUrls.length && !this.state.userId ? <Text style={styles.noPhotosText}>Looks like there are no photos near you...</Text>   : null}
        {this.state.imageUrls && !this.state.imageUrls.length && !this.state.userId ? <Text style={styles.noPhotosText2}>Be the first one to drop a photo!</Text>  : null}

        {this.state.imageUrls && !this.state.imageUrls.length && this.state.userId ? <Text style={styles.noPhotosText}>{`Looks like you haven't taken any photos...`}</Text>   : null}
        {this.state.imageUrls && !this.state.imageUrls.length && this.state.userId ? <Text style={styles.noPhotosText2}>Swipe to the camera and drop a photo!</Text>  : null}
        <ScrollView onLayout={this.handleRotation.bind(this)} contentContainerStyle={styles.scrollView}>
          {this.state.imageUrls ? this.renderRow(this.state.imageUrls) : null}
        </ScrollView>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  centering: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  noPhotosText: {
    marginTop: 65,
    fontSize: 18,
    textAlign: 'center',
    color: '#656565',
    fontFamily: 'circular'
  },
  noPhotosText2: {
    fontSize: 18,
    textAlign: 'center',
    color: '#656565',
    fontFamily: 'circular'
  },
  scrollView: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  image: {
    borderWidth: 1,
    borderColor: '#fff'
  },
  backIcon: {
    marginLeft: 15,
  },
  pageTitle: {
    fontSize: 18,
    fontFamily: 'circular',
    textAlign: 'center',
    color: '#565b5c'
  }
});

module.exports = PhotosView;

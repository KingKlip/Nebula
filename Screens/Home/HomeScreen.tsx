import {View, Text, StyleSheet, Image} from 'react-native'
import OptionsMenu from '@/components/features/Menu';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import users from '../../Testing/videos'

const user=users[0]

const Homepage=()=>{
  return(
    <View>
      <View style={styles.topBar}>
        <Text>
        <OptionsMenu /> {/* Menu component */}
        </Text>
        <FontAwesome name="search" size={30} color="black" />
        </View>

         <View style={styles.userProfileHeader}>
          <Text style= {styles.PostTitle}>
            {user.title}
          </Text>

          <Image style={styles.userImage} src = {user.thumbnailUrl} />

          <View style={styles.Details}>

            <Image style={styles.avatar} src ={user.thumbnailUrl} />
            <Text style={{fontSize:15, paddingLeft:12}}>
              {user.author}

            </Text>


          </View>

         </View>
      </View>

   
  )
}

const styles= StyleSheet.create({
  userProfileHeader:{
    marginLeft:10,
    marginTop: 5


  },

  avatar:{
    borderRadius:100,
    width:50,
    height:50,
   
  },

  PostTitle:{
    fontSize:22,


  },

  userImage:{
    alignItems:'center',
    justifyContent: 'center',
    width:350,
    height:300,

  },
  Details:{
paddingTop:5,
flexDirection:'row',
alignItems:'center',

  },

  topBar: {
    flexDirection: 'row',
    padding: 25,
    justifyContent: 'space-between',
  }
})

export default Homepage
